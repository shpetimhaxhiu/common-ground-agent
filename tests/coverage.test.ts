import test from "node:test"
import assert from "node:assert/strict"
import { buildCoverage } from "../lib/coverage"
const profiles = [
  { index: 0, interests: ["Jazz"] },
  { index: 1, interests: ["Coffee"] },
]
test("balance minimizes worst rank instead of averaging incompatible affinity scales", () => {
  const c = buildCoverage(["a", "b", "c"], profiles, [
    new Map([
      ["a", 0.9],
      ["b", 0.8],
      ["c", 0.7],
    ]),
    new Map([
      ["a", 0.1],
      ["b", 0.2],
      ["c", 0.3],
    ]),
  ])
  assert.deepEqual(c.balancedIds, ["b", "a", "c"])
  assert.equal(c.rows[1].worstRank, 2)
})
test("missing signals cannot win and zero is a real affinity", () => {
  const c = buildCoverage(["a", "b"], profiles, [
    new Map([
      ["a", 0],
      ["b", 1],
    ]),
    new Map([["a", 0]]),
  ])
  assert.deepEqual(c.balancedIds, ["a"])
  assert.equal(c.rows[0].affinities[0], 0)
  assert.equal(c.rows[1].worstRank, null)
})
test("equal affinities retain equal ranks with stable tie ordering", () => {
  const c = buildCoverage(["a", "b"], profiles, [
    new Map([
      ["a", 0.5],
      ["b", 0.5],
    ]),
    new Map([
      ["a", 0.5],
      ["b", 0.5],
    ]),
  ])
  assert.deepEqual(
    c.rows.map((r) => r.ranks),
    [
      [1, 1],
      [1, 1],
    ]
  )
  assert.deepEqual(c.balancedIds, ["a", "b"])
})
