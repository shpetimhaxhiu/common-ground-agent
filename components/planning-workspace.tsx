"use client"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Check,
  CircleHelp,
  Compass,
  Copy,
  HeartHandshake,
  LoaderCircle,
  MapPin,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  initialRequest,
  makePlanText,
  sampleSupport,
  type Candidate,
  type PlanningRequest,
  type PlanningResult,
} from "@/lib/domain"

type SavedPlan = {
  id: string
  title: string
  result: PlanningResult
  candidate: Candidate
  createdAt: string
}
const directions = {
  balanced: "Keep it balanced",
  quieter: "Somewhere quieter",
  "less-expensive": "Spend a little less",
  surprise: "Surprise us",
} as const
export function PlanningWorkspace() {
  const [form, setForm] = useState<PlanningRequest>(initialRequest)
  const [interestText, setInterestText] = useState<Record<string, string>>({})
  const [result, setResult] = useState<PlanningResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [saved, setSaved] = useState<SavedPlan[]>([])
  const [savedOpen, setSavedOpen] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [copyFallback, setCopyFallback] = useState("")
  const [exclusions, setExclusions] = useState<{ id: string; name: string }[]>(
    []
  )
  const editPerson = (
    index: number,
    field: "name" | "interests",
    value: string
  ) =>
    setForm((previous) => ({
      ...previous,
      participants: previous.participants.map((p, i) =>
        i !== index
          ? p
          : {
              ...p,
              [field]:
                field === "interests"
                  ? value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean)
                      .slice(0, 5)
                  : value,
            }
      ),
    }))
  async function buildPlan(next: PlanningRequest = form) {
    setError("")
    setNotice("")
    setBusy(true)
    setSelected(null)
    setCopyFallback("")
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
      const body = await response.json()
      if (!response.ok)
        throw new Error(body.error || "The plan could not be prepared.")
      setResult(body)
      setForm(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.")
    } finally {
      setBusy(false)
    }
  }
  async function openSaved() {
    setSavedOpen(true)
    setError("")
    try {
      const response = await fetch("/api/saved")
      const body = await response.json()
      if (!response.ok) throw new Error()
      setSaved(body.plans)
    } catch {
      setError(
        "Saved plans are unavailable. Check the local database and try again."
      )
    }
  }
  async function savePlan(candidate: Candidate) {
    if (!result) return
    setSaveBusy(true)
    setNotice("")
    setError("")
    try {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, candidate }),
      })
      if (!response.ok) throw new Error()
      setNotice("Saved to this browser’s private collection.")
    } catch {
      setError("The plan could not be saved. Your shortlist is still here.")
    } finally {
      setSaveBusy(false)
    }
  }
  async function copyPlan(candidate: Candidate) {
    if (!result) return
    const text = makePlanText(result, candidate)
    try {
      await navigator.clipboard.writeText(text)
      setNotice("Plan copied. Review the unknowns before sharing.")
    } catch {
      setCopyFallback(text)
      setNotice("Select and copy the plan below.")
    }
  }
  function exclude(candidate: Candidate) {
    setExclusions((previous) => [
      ...previous.filter((e) => e.id !== candidate.id),
      { id: candidate.id, name: candidate.name },
    ])
    void buildPlan({
      ...form,
      excluded: [...new Set([...form.excluded, candidate.id])],
    })
  }
  const stale =
    result &&
    JSON.stringify([
      form.mode,
      form.city,
      form.budget,
      form.date,
      form.time,
      form.revision,
      form.excluded,
      form.participants,
    ]) !==
      JSON.stringify([
        result.request.mode,
        result.request.city,
        result.request.budget,
        result.request.date,
        result.request.time,
        result.request.revision,
        result.request.excluded,
        result.request.participants,
      ])
  return (
    <div className="workspace">
      <a className="skip-link" href="#taste-table">
        Skip to planning
      </a>
      <header className="topbar">
        <Link href="/" className="wordmark">
          <span className="logo">
            <HeartHandshake size={23} />
          </span>
          Common Ground<span className="wordmark-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#taste-table" className="nav-current">
            The table
          </a>
          <Button variant="ghost" onClick={openSaved}>
            <Bookmark size={15} />
            Saved plans
          </Button>
        </nav>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="how-button" variant="outline">
              <CircleHelp size={16} />
              How it works
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>A plan that leaves room for everyone</DialogTitle>
              <DialogDescription>
                Start with the people, then make the trade-offs visible.
              </DialogDescription>
            </DialogHeader>
            <ol className="how-list">
              <li>Add two to four people and explicit interests.</li>
              <li>Set a city, date and budget target.</li>
              <li>Compare a shortlist or change the direction.</li>
              <li>Save or copy a plan after checking the unknowns.</li>
            </ol>
            <p className="small-copy">
              The sample contains fictional places. Live Qloo access is pending.
              Cultural affinities cannot establish an individual’s preference,
              venue noise, opening hours or access.
            </p>
          </DialogContent>
        </Dialog>
      </header>
      <div className="sample-ribbon" role="status">
        <span className="status-dot" />
        {form.mode === "sample"
          ? "SAMPLE WORKSPACE · Fictional places and prices. Live Qloo is not connected."
          : "LIVE MODE · Qloo access pending. No fallback to sample results."}
      </div>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">GOOD COMPANY. A BETTER PLAN.</p>
            <h1 id="hero-title">
              Different tastes.
              <br />
              One good <em>evening.</em>
            </h1>
            <p className="hero-description">
              Bring everyone’s interests to the table.
              <br />
              Find the overlap. Leave room for a little discovery.
            </p>
            <a href="#taste-table" className="text-link">
              Let’s find your common ground
              <ArrowDown size={16} />
            </a>
          </div>
          <div
            className="table-art"
            role="img"
            aria-label="Three sample tastes meeting around one table"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-label label-top">a little art</span>
            <span className="art-label label-left">something soulful</span>
            <span className="art-label label-bottom">room to talk</span>
            <div className="taste-card taste-card-one">
              <span>01 / MIRA</span>
              <b>
                Jazz &<br />
                independent cinema
              </b>
              <i>♪</i>
            </div>
            <div className="taste-card taste-card-two">
              <span>02 / LEO</span>
              <b>
                Art &<br />
                good coffee
              </b>
              <i>◒</i>
            </div>
            <div className="taste-card taste-card-three">
              <span>03 / NOOR</span>
              <b>
                Books &<br />
                vegetarian food
              </b>
              <i>❧</i>
            </div>
            <div className="center-note">
              <HeartHandshake size={27} />
              <span>
                meet in
                <br />
                <em>the middle</em>
              </span>
            </div>
            <span className="art-footnote">ILLUSTRATED SAMPLE GROUP</span>
          </div>
        </section>
        <section
          id="taste-table"
          className="planning-section"
          aria-labelledby="table-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / THE PEOPLE COME FIRST</p>
              <h2 id="table-title">Who’s at the table?</h2>
            </div>
            <span className="section-aside">
              A little about each of you.
              <br />
              No perfect match required.
            </span>
          </div>
          <div className="planning-layout">
            <div className="people-area">
              <div className="people-grid">
                {form.participants.map((person, index) => (
                  <article className={`person person-${index}`} key={person.id}>
                    <div className="person-top">
                      <span className="person-avatar">
                        {person.name.charAt(0) || "?"}
                      </span>
                      <span className="person-number">GUEST 0{index + 1}</span>
                      {form.participants.length > 2 && (
                        <button
                          className="icon-button"
                          aria-label={`Remove ${person.name}`}
                          onClick={() =>
                            setForm({
                              ...form,
                              participants: form.participants.filter(
                                (p) => p.id !== person.id
                              ),
                            })
                          }
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                    <Label htmlFor={`name-${person.id}`}>
                      Name or nickname
                    </Label>
                    <Input
                      id={`name-${person.id}`}
                      maxLength={30}
                      value={person.name}
                      onChange={(e) =>
                        editPerson(index, "name", e.target.value)
                      }
                    />
                    <Label
                      htmlFor={`interests-${person.id}`}
                      className="interest-label"
                    >
                      What are they into?
                    </Label>
                    <input
                      id={`interests-${person.id}`}
                      className="interest-input"
                      maxLength={400}
                      value={
                        interestText[person.id] ?? person.interests.join(", ")
                      }
                      onChange={(e) => {
                        setInterestText((previous) => ({
                          ...previous,
                          [person.id]: e.target.value,
                        }))
                        editPerson(index, "interests", e.target.value)
                      }}
                      aria-describedby={`hint-${person.id}`}
                    />
                    <span id={`hint-${person.id}`} className="field-hint">
                      Separate up to 5 interests with commas.
                    </span>
                  </article>
                ))}
              </div>
              <div className="people-footer">
                <Button
                  variant="ghost"
                  disabled={form.participants.length >= 4}
                  onClick={() =>
                    setForm({
                      ...form,
                      participants: [
                        ...form.participants,
                        {
                          id: crypto.randomUUID(),
                          name: `Guest ${form.participants.length + 1}`,
                          interests: ["Coffee"],
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add a person
                </Button>
                <span>
                  <Users size={14} />
                  {form.participants.length} of 4 seats filled
                </span>
              </div>
            </div>
            <aside className="occasion">
              <p className="eyebrow">THE OCCASION</p>
              <div className="form-field">
                <Label htmlFor="city">Where are we meeting?</Label>
                <div className="input-icon">
                  <MapPin size={16} />
                  <Input
                    id="city"
                    maxLength={80}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="field-pair">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">From</Label>
                  <Input
                    id="time"
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="budget-header">
                <Label htmlFor="budget">Budget per person</Label>
                <span>€{form.budget}</span>
              </div>
              <input
                id="budget"
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.budget}
                onChange={(e) =>
                  setForm({ ...form, budget: Number(e.target.value) })
                }
              />
              <div className="budget-scale">
                <span>€0</span>
                <span>€100</span>
              </div>
              <Label htmlFor="data-mode">Planning source</Label>
              <select
                id="data-mode"
                value={form.mode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mode: e.target.value as "sample" | "live",
                  })
                }
              >
                <option value="sample">Explore fictional sample</option>
                <option value="live">Live Qloo · access pending</option>
              </select>
              <Button
                className="find-button"
                disabled={busy}
                onClick={() => void buildPlan()}
              >
                {busy ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <Compass size={17} />
                )}
                Find common ground
                <ArrowRight size={16} />
              </Button>
              <p className="occasion-note">
                {form.mode === "sample"
                  ? "Sample works in Prishtina only. Places and prices are fictional."
                  : "Live budgets are targets. Venue details must be checked."}
              </p>
            </aside>
          </div>
          {error && (
            <div role="alert" className="message error">
              <CircleHelp size={18} />
              <span>{error}</span>
              <button
                className="icon-button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <p role="status" className="message">
              <Check size={16} />
              {notice}
            </p>
          )}
        </section>
        <section
          className="shortlist-section"
          aria-labelledby="shortlist-title"
          aria-busy={busy}
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / THE POSSIBILITIES</p>
              <h2 id="shortlist-title">
                {result
                  ? "A few ways to meet in the middle."
                  : "The best plan starts with your people."}
              </h2>
            </div>
            {result && (
              <span className="result-count">
                {result.candidates.length} possibilities
                <br />
                {result.mode === "sample" ? "Fictional sample" : "Qloo results"}
              </span>
            )}
          </div>
          {!result ? (
            <div className="empty-state">
              <div className="empty-symbol">
                <HeartHandshake size={30} />
              </div>
              <h3>Not another endless list.</h3>
              <p>
                A shortlist you can talk about. A reason for every choice.
                <br />
                Add your group above, then find your common ground.
              </p>
            </div>
          ) : (
            <>
              {stale && (
                <p className="message" role="status">
                  Your inputs changed. Find common ground again to update these
                  results.
                </p>
              )}
              <div className="revision-bar">
                <span>
                  <SlidersHorizontal size={15} />
                  Change the direction
                </span>
                {(Object.keys(directions) as (keyof typeof directions)[]).map(
                  (direction) => (
                    <Button
                      key={direction}
                      variant={
                        form.revision === direction ? "default" : "outline"
                      }
                      disabled={busy}
                      onClick={() =>
                        void buildPlan({ ...form, revision: direction })
                      }
                    >
                      {directions[direction]}
                    </Button>
                  )
                )}
              </div>
              {exclusions.length > 0 && (
                <div className="exclusion-list">
                  <span>Off the table:</span>
                  {exclusions.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        setExclusions(exclusions.filter((x) => x.id !== e.id))
                        void buildPlan({
                          ...form,
                          excluded: form.excluded.filter((id) => id !== e.id),
                        })
                      }}
                    >
                      {e.name}
                      <RotateCcw size={12} />
                      Restore
                    </button>
                  ))}
                </div>
              )}
              {result.candidates.length === 0 ? (
                <div className="empty-state">
                  <h3>Nothing fits this version of the plan.</h3>
                  <p>
                    Raise the sample budget, restore an excluded option, or
                    change the direction.
                  </p>
                </div>
              ) : (
                <div className="candidate-list">
                  {result.candidates.map((candidate, index) => (
                    <article className="candidate" key={candidate.id}>
                      <div
                        className={`venue-art venue-art-${index}`}
                        aria-hidden="true"
                      >
                        <span className="venue-art-type">{candidate.kind}</span>
                        <div className="venue-shape">
                          <span />
                          <span />
                          <span />
                        </div>
                        <b>
                          {candidate.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </b>
                        <span className="venue-art-caption">
                          {candidate.source === "fictional-sample"
                            ? "FICTIONAL PLACE / SAMPLE"
                            : "QLOO RESULT / NO VENUE PHOTO"}
                        </span>
                      </div>
                      <div className="candidate-body">
                        <div className="candidate-meta">
                          <span>
                            0{index + 1} / {candidate.kind}
                          </span>
                          <span>
                            {candidate.price === null
                              ? "Price unverified"
                              : `€${candidate.price} · fictional estimate`}
                          </span>
                        </div>
                        <h3>{candidate.name}</h3>
                        <p className="candidate-description">
                          {candidate.description}
                        </p>
                        <div className="support-list">
                          {result.mode === "sample" ? (
                            result.request.participants.map((person) => {
                              const interests = sampleSupport(candidate, person)
                              return (
                                <div key={person.id}>
                                  <span className="support-name">
                                    {person.name}
                                  </span>
                                  <span>
                                    {interests.length
                                      ? interests.join(" + ")
                                      : "No direct tag overlap in sample"}
                                  </span>
                                </div>
                              )
                            })
                          ) : (
                            <p>
                              Returned for the combined group query. Individual
                              fit has not been measured.
                            </p>
                          )}
                        </div>
                        <p className="trade-off">
                          <span>The trade-off</span>
                          {candidate.note}
                        </p>
                        <div className="candidate-actions">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelected(candidate)
                              setCopyFallback("")
                              setNotice("")
                              setError("")
                            }}
                          >
                            Make this the plan
                            <ArrowRight size={15} />
                          </Button>
                          <button
                            className="text-button"
                            disabled={busy}
                            onClick={() => exclude(candidate)}
                          >
                            Not for us
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <details className="trace-panel">
                <summary>
                  <Sparkles size={16} />
                  How this shortlist was made<span>Source & limitations</span>
                </summary>
                <ol>
                  {result.trace.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="trace-warnings">
                  {result.warnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </div>
              </details>
            </>
          )}
        </section>
      </main>
      <footer>
        <Link href="/" className="wordmark">
          Common Ground<span className="wordmark-dot">.</span>
        </Link>
        <p>Good plans leave room for people.</p>
        <span>LOCAL BUILD · NO RESERVATIONS OR PURCHASES</span>
      </footer>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="plan-dialog">
          <DialogHeader>
            <p className="eyebrow">THE PLAN, FOR NOW</p>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {result?.mode === "sample"
                ? "Fictional sample — not a real venue recommendation."
                : "Qloo-backed option. Verify details directly before going."}
            </DialogDescription>
          </DialogHeader>
          {selected && result && (
            <>
              <div className="plan-facts">
                <span>
                  <MapPin size={15} />
                  {result.request.city}
                </span>
                <span>
                  {result.request.date} · {result.request.time}
                </span>
                <span>€{result.request.budget} target / person</span>
              </div>
              <p>{selected.description}</p>
              <p className="small-copy">{selected.note}</p>
              <div className="check-before">
                <h4>Before you head out</h4>
                <ul>
                  <li>Confirm opening hours and current prices.</li>
                  <li>Check availability, dietary suitability and access.</li>
                  <li>Nothing has been booked or purchased.</li>
                </ul>
              </div>
              <div className="dialog-actions">
                <Button
                  disabled={saveBusy}
                  onClick={() => void savePlan(selected)}
                >
                  <Bookmark size={15} />
                  {saveBusy ? "Saving…" : "Save plan"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void copyPlan(selected)}
                >
                  <Copy size={15} />
                  Copy plan
                </Button>
              </div>
              <button
                className="text-button"
                onClick={() =>
                  setCopyFallback(
                    copyFallback ? "" : makePlanText(result, selected)
                  )
                }
              >
                {copyFallback ? "Hide plan text" : "View copyable plan text"}
              </button>
              {notice && (
                <p className="small-copy" role="status">
                  {notice}
                </p>
              )}
              {error && (
                <p className="error small-copy" role="alert">
                  {error}
                </p>
              )}
              {copyFallback && (
                <textarea
                  className="copy-fallback"
                  aria-label="Copyable plan"
                  readOnly
                  value={copyFallback}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={savedOpen} onOpenChange={setSavedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your saved plans</DialogTitle>
            <DialogDescription>
              Private to this browser. Clearing this app’s site data disconnects
              the collection.
            </DialogDescription>
          </DialogHeader>
          {error && <p role="alert">{error}</p>}
          {saved.length === 0 ? (
            <p className="small-copy">
              No saved plans here yet. Choose an option and save it.
            </p>
          ) : (
            <div className="saved-list">
              {saved.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setForm(plan.result.request)
                    setInterestText({})
                    setResult(plan.result)
                    setExclusions([])
                    setSelected(plan.candidate)
                    setSavedOpen(false)
                  }}
                >
                  <span>
                    <b>{plan.title}</b>
                    <small>
                      {plan.result.request.city} · {plan.result.request.date} ·{" "}
                      {plan.result.mode}
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
