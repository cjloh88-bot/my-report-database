"use client";
import { useState } from "react";

export function AdminDeleteButton() {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return <button type="button" className="text-danger" onClick={() => setConfirming(true)}>Remove</button>;
  return <span className="admin-confirm" role="alert"><span>Permanently remove?</span><button type="submit" className="text-danger" autoFocus>Confirm</button><button type="button" onClick={() => setConfirming(false)}>Cancel</button></span>;
}

