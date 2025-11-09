import type { JSX } from 'react'
import React from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'

export function App(): JSX.Element {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="font-semibold">TinyPubSub</div>
          <div className="flex items-center gap-2">
            <a href="https://github.com/SalvadorCardona/TinyPubSub" target="_blank" rel="noreferrer">
              <Button variant="ghost">GitHub</Button>
            </a>
            <a href="https://www.npmjs.com/package/tiny-pub-sub" target="_blank" rel="noreferrer">
              <Button variant="ghost">npm</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Pub/Sub minimaliste pour JS/TS
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            TinyPubSub est une petite bibliothèque de publication/abonnement, simple, typée et ultra‑rapide.
          </p>
          <div className="flex items-center justify-center gap-3">

          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Ultra léger</CardTitle>
            </CardHeader>
            <CardContent>Pas de dépendances lourdes, API minimale.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>TypeScript prêt</CardTitle>
            </CardHeader>
            <CardContent>Types complets pour une DX au top.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Performant</CardTitle>
            </CardHeader>
            <CardContent>Publication/abonnement rapides et prévisibles.</CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground flex items-center gap-1">
          <span>©</span>
          <span>{new Date().getFullYear()}</span>
          <span>TinyPubSub.</span>
        </div>
      </footer>
    </div>
  )
}
