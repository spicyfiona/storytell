"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RefreshCw, Send, Sun, Moon, Monitor, X } from "lucide-react"

// ─── Emoji pool ───────────────────────────────────────────────────────────────
const EMOJI_POOL = [
  "😀","😂","😍","🤔","😴","😎","🙄","😱","🤯","🥳",
  "🐶","🐱","🦊","🐻","🐼","🦁","🐯","🦄","🐸","🐧",
  "🌈","☀️","🌙","⭐","🌊","🔥","❄️","🌸","🌵","🍄",
  "🏠","🏰","🏝️","🏔️","🚗","✈️","🚀","⛵","🚲","🎠",
  "🍎","🍕","🍦","🍩","🍫","🍿","🎂","🍔","🌮","🍣",
  "⚽","🏀","🎮","🎨","🎭","🎬","📚","🎵","🎤","🔮",
  "👑","💍","💰","🎁","⏰","🧸","🧩","🔑","💡","🌍",
]

// Common word lists for scoring
const COMMON_ADJECTIVES = [
  "big","small","happy","sad","beautiful","ugly","fast","slow","bright","dark",
  "old","new","young","good","bad","hot","cold","warm","cool","soft","hard",
  "loud","quiet","sweet","bitter","smooth","rough","tall","short","rich","poor",
  "brave","scared","angry","calm","wild","tame","clever","silly","kind","mean",
  "shiny","dull","magic","magical","mysterious","wonderful","amazing","terrible",
  "lovely","pretty","ugly","huge","tiny","giant","little","great","awful",
  "colorful","golden","silver","ancient","modern","strange","weird","funny"
]

const COMMON_NOUNS = [
  "dog","cat","house","tree","sun","moon","star","fire","water","earth",
  "sky","mountain","river","ocean","forest","castle","king","queen","prince",
  "princess","dragon","unicorn","bird","fish","bear","fox","lion","tiger",
  "rabbit","wolf","snake","frog","butterfly","flower","garden","road","path",
  "door","window","key","treasure","gold","diamond","crown","sword","shield",
  "book","story","dream","night","day","morning","evening","friend","enemy",
  "hero","monster","ghost","witch","wizard","fairy","angel","demon","world",
  "adventure","journey","quest","mystery","secret","magic","love","hate","fear",
  "joy","hope","man","woman","child","boy","girl","baby","family","home"
]

const COMMON_VERBS = [
  "run","walk","jump","fly","swim","climb","fall","dance","sing","play",
  "eat","drink","sleep","wake","dream","think","feel","see","hear","smell",
  "touch","taste","love","hate","want","need","find","lose","give","take",
  "make","break","build","destroy","create","discover","explore","travel",
  "fight","win","lose","hide","seek","chase","catch","escape","save","help",
  "hurt","heal","grow","shrink","change","become","begin","end","start","stop",
  "open","close","enter","leave","arrive","depart","rise","set","shine","glow",
  "laugh","cry","smile","frown","shout","whisper","speak","listen","watch","wait"
]

// ─── Theme toggle ─────────────────────────────────────────────────────────────
type Theme = "light" | "dark" | "system"

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    localStorage.setItem("theme", theme)

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
    } else {
      root.classList.toggle("dark", theme === "dark")
    }
  }, [theme])

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full transition-colors ${theme === "light" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full transition-colors ${theme === "dark" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full transition-colors ${theme === "system" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-label="System mode"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Floating clap particle ───────────────────────────────────────────────────
interface ClapParticle {
  id: number
  x: number
  y: number
  size: "sm" | "lg"
}

function ClapLayer({ active, burst }: { active: boolean; burst: boolean }) {
  const [particles, setParticles] = useState<ClapParticle[]>([])
  const counterRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const burstRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Typing claps — small, sparse
  useEffect(() => {
    if (active && !burst) {
      intervalRef.current = setInterval(() => {
        const id = counterRef.current++
        setParticles((prev) => [
          ...prev,
          { id, x: Math.random() * 90 + 5, y: Math.random() * 70 + 10, size: "sm" },
        ])
        setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 1200)
      }, 220)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [active, burst])

  // Submission burst — large, dense, for 5–8 seconds
  useEffect(() => {
    if (burst) {
      if (burstRef.current) clearInterval(burstRef.current)
      burstRef.current = setInterval(() => {
        const id = counterRef.current++
        setParticles((prev) => [
          ...prev,
          { id, x: Math.random() * 96 + 2, y: Math.random() * 80 + 5, size: "lg" },
        ])
        setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 1400)
      }, 80)
    } else {
      if (burstRef.current) clearInterval(burstRef.current)
    }
    return () => { if (burstRef.current) clearInterval(burstRef.current) }
  }, [burst])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute select-none animate-clap ${p.size === "lg" ? "text-5xl" : "text-2xl"}`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          👏
        </span>
      ))}
    </div>
  )
}

// ─── Score overlay ────────────────────────────────────────────────────────────
interface WordAnalysis {
  adjectives: string[]
  nouns: string[]
  verbs: string[]
  totalScore: number
}

function ScoreOverlay({
  analysis,
  onClose,
}: {
  analysis: WordAnalysis
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card p-10 md:p-12 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-10">
          <p className="text-sm font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Your Score
          </p>
          <p className="text-8xl md:text-9xl font-bold text-foreground leading-none mb-4">
            {analysis.totalScore}
          </p>
          <p className="text-lg font-sans text-muted-foreground max-w-sm mx-auto">
            Great job bringing those emojis to life! Every word adds to your story.
          </p>
        </div>

        <div className="space-y-6">
          {/* Adjectives */}
          <div className="rounded-2xl bg-muted/50 p-6">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Adjectives
              </h2>
              <span className="rounded-full bg-secondary px-4 py-1 text-lg font-bold text-secondary-foreground">
                +{analysis.adjectives.length * 5}
              </span>
            </div>
            <p className="text-sm font-sans text-muted-foreground mb-4">5 points each</p>
            {analysis.adjectives.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analysis.adjectives.map((word, i) => (
                  <span key={i} className="rounded-full bg-card border border-border px-4 py-2 text-base font-medium text-foreground">
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-sans text-muted-foreground">None found</p>
            )}
          </div>

          {/* Nouns */}
          <div className="rounded-2xl bg-muted/50 p-6">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Nouns
              </h2>
              <span className="rounded-full bg-secondary px-4 py-1 text-lg font-bold text-secondary-foreground">
                +{analysis.nouns.length * 3}
              </span>
            </div>
            <p className="text-sm font-sans text-muted-foreground mb-4">3 points each</p>
            {analysis.nouns.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analysis.nouns.map((word, i) => (
                  <span key={i} className="rounded-full bg-card border border-border px-4 py-2 text-base font-medium text-foreground">
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-sans text-muted-foreground">None found</p>
            )}
          </div>

          {/* Verbs */}
          <div className="rounded-2xl bg-muted/50 p-6">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Verbs
              </h2>
              <span className="rounded-full bg-secondary px-4 py-1 text-lg font-bold text-secondary-foreground">
                +{analysis.verbs.length * 8}
              </span>
            </div>
            <p className="text-sm font-sans text-muted-foreground mb-4">8 points each</p>
            {analysis.verbs.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {analysis.verbs.map((word, i) => (
                  <span key={i} className="rounded-full bg-card border border-border px-4 py-2 text-base font-medium text-foreground">
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-sans text-muted-foreground">None found</p>
            )}
          </div>
        </div>

        <Button
          className="w-full h-14 rounded-2xl text-lg font-semibold mt-8"
          onClick={onClose}
        >
          Next Round
        </Button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Storytell() {
  const [emojis, setEmojis] = useState<string[]>([])
  const [story, setStory] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [remixCount, setRemixCount] = useState(0)
  const [remixSpin, setRemixSpin] = useState(false)
  const [analysis, setAnalysis] = useState<WordAnalysis | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [clapBurst, setClapBurst] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const burstTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clapping = story.length > 50 && !submitted
  const maxRemixes = 3
  const remixesLeft = maxRemixes - remixCount

  const generateEmojis = useCallback((isRemix = false) => {
    const count = Math.floor(Math.random() * 3) + 3
    const shuffled = [...EMOJI_POOL].sort(() => 0.5 - Math.random())
    setEmojis(shuffled.slice(0, count))
    setStory("")
    setSubmitted(false)
    setAnalysis(null)
    setShowOverlay(false)
    if (isRemix) {
      setRemixCount((prev) => prev + 1)
    }
  }, [])

  useEffect(() => {
    generateEmojis()
  }, [generateEmojis])

  const handleRemix = () => {
    if (remixesLeft <= 0) return
    setRemixSpin(true)
    setTimeout(() => setRemixSpin(false), 600)
    generateEmojis(true)
  }

  const handleNextRound = () => {
    setRemixCount(0)
    generateEmojis()
  }

  const analyzeStory = (text: string): WordAnalysis => {
    const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean)
    const uniqueWords = [...new Set(words)]

    const adjectives = uniqueWords.filter((w) => COMMON_ADJECTIVES.includes(w))
    const nouns = uniqueWords.filter((w) => COMMON_NOUNS.includes(w))
    const verbs = uniqueWords.filter((w) => COMMON_VERBS.includes(w))

    const totalScore = adjectives.length * 5 + nouns.length * 3 + verbs.length * 8

    return { adjectives, nouns, verbs, totalScore }
  }

  const playClap = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://cdn.freesound.org/previews/185/185099_2432560-lq.mp3")
      audioRef.current.loop = true
    }
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  const stopClap = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const triggerBurst = () => {
    // Pick a random duration between 5 and 8 seconds
    const duration = Math.floor(Math.random() * 3000) + 5000
    setClapBurst(true)
    playClap()
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current)
    burstTimerRef.current = setTimeout(() => {
      setClapBurst(false)
      stopClap()
    }, duration)
  }

  const evaluateStory = () => {
    if (!story.trim()) return
    const result = analyzeStory(story)
    setAnalysis(result)
    setSubmitted(true)
    setShowOverlay(true)
    triggerBurst()
  }

  const handleCloseOverlay = () => {
    setShowOverlay(false)
    setClapBurst(false)
    stopClap()
    if (burstTimerRef.current) clearTimeout(burstTimerRef.current)
    handleNextRound()
  }

  return (
    <>
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Floating clap animation layer */}
      <ClapLayer active={clapping} burst={clapBurst} />

      {/* Score overlay */}
      {showOverlay && analysis && (
        <ScoreOverlay analysis={analysis} onClose={handleCloseOverlay} />
      )}

      <main className="relative z-10 min-h-screen bg-background flex flex-col items-center px-4 py-16 md:py-24">

        {/* ── Header (outside the container) ── */}
        <header className="w-full max-w-xl mb-10 text-center">
          <h1 className="text-6xl md:text-7xl font-serif font-bold tracking-tight text-foreground text-balance leading-none mb-4">
            Storytell
          </h1>
          <p className="text-base font-sans text-muted-foreground leading-relaxed max-w-md mx-auto">
            Below is a series of emojis. What do they mean to you? Write a story that brings them to life. The more descriptive you are, the higher you rank.
          </p>
        </header>

        {/* ── Game container ── */}
        <div className="w-full max-w-xl space-y-4">

          {/* Emoji surface plate */}
          <div className="rounded-2xl border border-border bg-card shadow-sm px-8 py-10 flex items-center justify-center gap-3 min-h-[120px]">
            {emojis.map((emoji, i) => (
              <span
                key={i}
                className="text-5xl md:text-6xl leading-none select-none"
                aria-label={`Emoji ${i + 1}`}
              >
                {emoji}
              </span>
            ))}
          </div>

          {/* Remix button — directly under the emoji plate */}
          <div className="flex justify-center">
            <button
              onClick={handleRemix}
              disabled={remixesLeft <= 0 || submitted}
              aria-label="Remix emojis"
              className={`flex items-center gap-2 text-sm font-medium transition-colors duration-150 ${
                remixesLeft <= 0 || submitted
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RefreshCw
                className={`h-4 w-4 transition-transform duration-500 ${remixSpin ? "rotate-180" : ""}`}
              />
              Remix ({remixesLeft} left)
            </button>
          </div>

          {/* Textarea — no placeholder copy */}
          <div className="space-y-2">
            <Textarea
              className="min-h-[160px] text-base font-sans resize-none rounded-2xl border-border bg-card focus-visible:ring-foreground focus-visible:ring-1 focus-visible:ring-offset-0"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              disabled={submitted}
              aria-label="Write your story"
            />
            <p className="text-sm font-sans text-muted-foreground text-right">
              {story.length} characters
            </p>
          </div>

          {/* Submit */}
          <Button
            className="w-full h-12 rounded-2xl text-base font-semibold"
            onClick={evaluateStory}
            disabled={story.trim().length === 0 || submitted}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </div>
      </main>
    </>
  )
}
