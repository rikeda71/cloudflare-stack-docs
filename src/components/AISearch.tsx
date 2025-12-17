import type React from "react";
import { useCallback, useState } from "react";
import "./AISearch.css";

interface Source {
  title: string;
  url: string;
  score: number;
}

interface SearchResult {
  answer: string;
  sources: Source[];
}

const AISearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useStream, setUseStream] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, stream: useStream }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || `Error: ${response.status}`);
      }

      if (!useStream) {
        const data = (await response.json()) as {
          response: string;
          data: Array<{
            filename: string;
            score: number;
          }>;
        };

        // sourcesのフォーマット
        const formattedSources = data.data.map((item) => {
          // URLの処理:
          const url = item.filename
            .replace(/^docs\//, "") // docs/を削除
            .replace(/\.md$/, "") // .mdを削除
            .replace(/\/index$/, ""); // /indexを削除(index.md 対応)

          return {
            title: item.filename,
            url: url,
            score: item.score,
          };
        });

        setResult({
          answer: data.response,
          sources: formattedSources,
        });
      } else {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to read stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let answer = "";
        const sources: Source[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

            // Fetch Streamingで受信したSSE形式フォーマットのデータを処理
            const data = line.startsWith("data: ") ? line.slice(6) : line;
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);

              if (parsed.response) {
                answer += parsed.response;
              }

              setResult({ answer, sources });
            } catch {
              // プレーンテキストとして処理
              answer += data;
              setResult({ answer, sources });
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [query, useStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  return (
    <div className="ai-search">
      <div className="search-header">
        <p className="search-description">キーワードを入力して、ドキュメントをAIで検索できます</p>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="検索キーワードを入力..."
            className="search-input"
            disabled={isLoading}
          />
          <button type="submit" className="search-button" disabled={isLoading || !query.trim()}>
            {isLoading ? <span className="loading-spinner">検索中...</span> : "検索"}
          </button>
        </div>
      </form>

      <div className="stream-toggle">
        <label>
          <input
            type="checkbox"
            checked={useStream}
            onChange={(e) => setUseStream(e.target.checked)}
            disabled={isLoading}
          />
          <span>ストリーミングモード</span>
        </label>
        <p className="stream-toggle-note">
          {useStream
            ? "⚠️ 参照元を確認したい場合は、通常モードをご利用ください。(Rag Backend の仕様による制限)"
            : "検索結果と参照元情報が表示されます。"}
        </p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {result && (
        <div className="search-results">
          <div className="answer-section">
            <h2>回答</h2>
            <div className="answer-content">
              {result.answer.split("\n").map((line, i) => (
                <p key={`answer-line-${i}-${line.slice(0, 10)}`}>{line}</p>
              ))}
            </div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className="sources-section">
              <h3>参照元</h3>
              <ul className="sources-list">
                {result.sources.map((source, index) => (
                  <li key={`source-${source.url || source.title || index}`} className="source-item">
                    <span className="source-title">📄 {source.title}</span>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                      開く ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!query && !result && !error && (
        <div className="empty-state">
          <p>検索キーワードを入力してください</p>
        </div>
      )}
    </div>
  );
};

export default AISearch;
