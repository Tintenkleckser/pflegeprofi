export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/supabase/auth-helpers';
import { prisma } from '@/lib/db';
import { retrieveHandbookContext } from '@/lib/handbook-rag';
import { getRelevantGlossaryContext } from '@/lib/glossary-context';
import { createMistralChatCompletion, type MistralMessage } from '@/lib/mistral';
import { compactMessages, getClientIp, rateLimit, textLength } from '@/lib/api-protection';

const MAX_USER_MESSAGE_LENGTH = 2000;
const MAX_PREVIOUS_MESSAGES = 20;
const MAX_PREVIOUS_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const limit = rateLimit({
      key: `stream:${user.id}:${getClientIp(request)}`,
      limit: 40,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.allowed) {
      const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
      return new Response(
        JSON.stringify({ error: 'Zu viele Anfragen. Bitte versuchen Sie es gleich erneut.' }),
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }

    const body = await request.json();
    const {
      simId,
      templateId,
      userMessage,
      turnNumber,
      languageMode,
      isLastTurn,
      previousMessages,
    } = body ?? {};

    if (!simId || !userMessage) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    if (textLength(userMessage) > MAX_USER_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: 'Die Eingabe ist zu lang.' }), { status: 413 });
    }

    const simulation = await prisma.userSimulation.findFirst({
      where: { id: simId, userId: user.id },
      select: { id: true, templateId: true, status: true },
    });
    if (!simulation) {
      return new Response(JSON.stringify({ error: 'Simulation not found' }), { status: 404 });
    }

    if (simulation.status === 'completed') {
      return new Response(JSON.stringify({ error: 'Simulation is already completed' }), { status: 409 });
    }

    if (templateId && templateId !== simulation.templateId) {
      return new Response(JSON.stringify({ error: 'Template mismatch' }), { status: 400 });
    }

    // Get template
    const template = await prisma.simulationTemplate.findUnique({
      where: { id: simulation.templateId },
    });
    if (!template) {
      return new Response(JSON.stringify({ error: 'Template not found' }), { status: 404 });
    }

    const isBilingual = languageMode === 'bilingual';

    // Retrieve only relevant glossary entries for bilingual mode.
    let glossaryContext = '';
    if (isBilingual) {
      try {
        glossaryContext = await getRelevantGlossaryContext(userMessage);
      } catch (e) {
        // Fallback: continue without glossary
      }
    }

    // RAG: Retrieve relevant handbook context based on the user message
    let handbookContext = '';
    try {
      handbookContext = await retrieveHandbookContext(userMessage, template.domain ?? 'nursing', 3);
    } catch (e) {
      // Fallback: continue without handbook context
    }

    // Build system prompt
    let systemPrompt = template.systemPrompt ?? '';
    if (handbookContext) {
      systemPrompt += `\n${handbookContext}`;
    }
    systemPrompt += `\n\nSPRACHMODUS: ${isBilingual ? 'BILINGUAL' : 'GERMAN_ONLY'}\n`;
    if (isBilingual) {
      systemPrompt += `
- Führe das Gespräch auf Deutsch.
- Wenn der Kandidat etwas nicht versteht, erkläre es zusätzlich auf Türkisch in eckigen Klammern [TR: ...].
- Gib Hinweise zweisprachig: Erst Deutsch, dann [TR: türkische Übersetzung].
${glossaryContext}`;
    } else {
      systemPrompt += `\n- Führe das Gespräch ausschließlich auf Deutsch.\n- Antworte niemals auf Türkisch.\n`;
    }

    if (isLastTurn) {
      systemPrompt += `\n\nWICHTIG: Dies ist die LETZTE Interaktion. Beende das Gespräch natürlich als Patient und bedanke dich beim Kandidaten. Sage etwas wie "Danke, dass Sie sich so gut um mich gekümmert haben."\n`;
    }

    // Build messages array
    const llmMessages: MistralMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add previous conversation
    const safePreviousMessages = compactMessages(previousMessages, {
      maxMessages: MAX_PREVIOUS_MESSAGES,
      maxContentLength: MAX_PREVIOUS_MESSAGE_LENGTH,
    });

    for (const msg of safePreviousMessages) {
      llmMessages.push({
        role: msg?.role === 'user' ? 'user' : 'assistant',
        content: msg?.content ?? '',
      });
    }
    llmMessages.push({ role: 'user', content: userMessage });

    // Call LLM with streaming
    const llmResponse = await createMistralChatCompletion({
      messages: llmMessages,
      stream: true,
      maxTokens: 800,
      temperature: 0.7,
    });

    if (!llmResponse?.ok) {
      const errText = await llmResponse?.text?.();
      console.error('LLM API error:', errText);
      return new Response(JSON.stringify({ error: 'LLM API error' }), { status: 500 });
    }

    // Stream response back to client and collect full response
    let fullContent = '';
    const stream = new ReadableStream({
      async start(controller) {
        const reader = llmResponse.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let partialRead = '';
        try {
          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            partialRead += decoder.decode(value, { stream: true });
            const lines = partialRead.split('\n');
            partialRead = lines.pop() ?? '';
            for (const line of lines) {
              if (line?.startsWith?.('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed?.choices?.[0]?.delta?.content ?? '';
                  if (delta) fullContent += delta;
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } catch (e: any) {
                  // skip
                }
              }
            }
          }
        } catch (error: any) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          // Save interaction to database
          try {
            await prisma.simulationInteraction.create({
              data: {
                simulationId: simId,
                turnNumber: turnNumber ?? 1,
                userInput: userMessage,
                aiResponse: fullContent,
              },
            });
          } catch (dbErr: any) {
            console.error('DB save error:', dbErr);
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Stream route error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
