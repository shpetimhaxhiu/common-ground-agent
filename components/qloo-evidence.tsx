import type { PlanningResult } from "@/lib/domain"
import { qlooTagCategory } from "@/lib/qloo-presentation"

export function QlooEvidence({ result }: { result: PlanningResult }) {
  if (result.mode !== "live") return null
  return (
    <section className="qloo-evidence" aria-labelledby="qloo-evidence-title">
      <div className="qloo-evidence-heading">
        <div>
          <p className="eyebrow">POWERED BY QLOO / THE TASTE CONNECTION</p>
          <h2 id="qloo-evidence-title">From your tastes to a shared place.</h2>
        </div>
        <span className="qloo-source-label">
          Qloo data · no invented places
        </span>
      </div>
      <p className="qloo-evidence-intro">
        Qloo connects cultural interests to real places. Follow the signals
        behind this shortlist; the comparison works without an AI-generated
        explanation.
      </p>
      <ol className="qloo-journey">
        <li>
          <span className="eyebrow">01 / UNDERSTAND THE TASTES</span>
          <h3>The taste signals behind this query.</h3>
          {result.resolvedTags?.length ? (
            <ul className="qloo-taste-tags">
              {result.resolvedTags.map((tag) => (
                <li key={tag.input}>
                  <span>
                    <strong>{tag.input}</strong>{" "}
                    <span aria-hidden="true">→</span>{" "}
                    {qlooTagCategory(tag.id).label}
                  </span>
                  <small>
                    {tag.name.startsWith("urn:")
                      ? "Selected Qloo category"
                      : `Resolved by Qloo: ${tag.name}`}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>This saved result does not include resolved tag evidence.</p>
          )}
        </li>
        <li>
          <span className="eyebrow">02 / DISCOVER ACROSS TASTES</span>
          <h3>{result.candidates.length} real places in the shortlist.</h3>
          <p>
            The combined interests were sent to Qloo for places in{" "}
            <strong>{result.request.city}</strong>. Place names and descriptions
            below come from Qloo; prices and venue conditions remain unverified.
          </p>
        </li>
        <li>
          <span className="eyebrow">03 / SEE THE TRADE-OFF</span>
          <h3>
            {result.coverage
              ? "The same places, a separate view for each profile."
              : "Ready for a profile-by-profile comparison."}
          </h3>
          <p>
            {result.coverage
              ? `Qloo affinity was requested separately for ${result.coverage.profiles.length} explicit interest profiles. The table below shows the returned scores; Common Ground applies the balance rule.`
              : "Choose Compare everyone’s signals to request Qloo affinities for each profile against this shortlist."}
          </p>
        </li>
      </ol>
      <details className="qloo-record">
        <summary>Inspect the Qloo evidence</summary>
        <p>
          Qloo tags used for the query and entity identifiers from this result.
          These identify the source records; they are not personal preference
          scores. Selected tag IDs are supplied explicitly; other named
          interests are resolved by Qloo before retrieval.
        </p>
        <ul>
          {result.resolvedTags?.map((tag) => (
            <li key={tag.id + tag.input}>
              {tag.input}: <code>{tag.id}</code>
            </li>
          ))}
        </ul>
        <ul>
          {result.candidates.map((candidate) => (
            <li key={candidate.id}>
              {candidate.name}: <code>{candidate.id}</code>
            </li>
          ))}
        </ul>
        <p>
          Result prepared:{" "}
          <time dateTime={result.createdAt}>
            {result.createdAt.replace("T", " ").slice(0, 19)} UTC
          </time>
          . Recent provider results may be reused briefly; no generated
          substitute is used.
        </p>
      </details>
    </section>
  )
}
