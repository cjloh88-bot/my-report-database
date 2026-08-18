import Link from "next/link";

export default function NotFound() {
  return <section className="panel error-state"><p className="eyebrow">NOT FOUND</p><h1>That record isn’t here</h1><p>It may have been deleted, or the link may be incomplete.</p><Link className="button" href="/">Return to dashboard</Link></section>;
}
