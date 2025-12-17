import type { APIRoute } from "astro";

export const prerender = false;
const RAG_NAME = "docs-ai-search";

interface SearchRequestBody {
  query: string;
  stream: boolean;
}

interface ErrorResponse {
  error: string;
}

// レスポンスヘッダーの定数
const STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
} as const;

const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

/**
 * AI検索を実行してレスポンスを返す
 */
async function executeAISearch(locals: App.Locals, reqBody: SearchRequestBody): Promise<Response> {
  const { query, stream } = reqBody;
  const result = await locals.runtime.env.AI.autorag(RAG_NAME).aiSearch({
    query,
    stream,
    max_num_results: 3,
    ranking_options: {
      score_threshold: 0.55, // NOTE: 経験的に良い結果が得られる値
    },
  });

  // ReadableStreamの場合、Responseにラップして返す
  if (result && typeof result === "object" && "body" in result) {
    return new Response(result.body as ReadableStream, {
      headers: STREAM_HEADERS,
    });
  }

  // それ以外の場合はJSON形式で返す
  return new Response(JSON.stringify(result), {
    headers: JSON_HEADERS,
  });
}

/**
 * エラーレスポンスを生成
 */
function createErrorResponse(error: string, status: number): Response {
  const errorResponse: ErrorResponse = { error };
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: JSON_HEADERS,
  });
}

/**
 * リクエストボディをパース
 */
async function parseSearchRequest(request: Request): Promise<SearchRequestBody> {
  const body = (await request.json()) as SearchRequestBody;
  return {
    query: body.query, // TODO: RAG の pre-prompt を追加して、検索結果を改善する
    stream: body.stream,
  };
}

/**
 * POST /api/search
 * AI検索を実行してレスポンスを返す
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const requestBody = await parseSearchRequest(request);

    return await executeAISearch(locals, requestBody);
  } catch (error) {
    console.error("Search error:", error);

    if (error instanceof Error && error.message.includes("Query parameter")) {
      return createErrorResponse("無効なリクエスト形式、またはクエリが必要です", 400);
    }

    const errorMessage = error instanceof Error ? error.message : "検索中にエラーが発生しました";
    return createErrorResponse(errorMessage, 500);
  }
};
