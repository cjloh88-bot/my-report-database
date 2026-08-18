"use client";
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) { return <section className="panel error-state"><p className="eyebrow">CONNECTION ERROR</p><h1>We couldn’t load this view</h1><p>{error.message}</p><button className="button" onClick={reset}>Try again</button></section>; }

