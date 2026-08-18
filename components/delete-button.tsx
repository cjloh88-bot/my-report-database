"use client";
import { useState } from "react";

export function DeleteButton({ label = "Delete" }: { label?: string }) {
  const [armed, setArmed] = useState(false);
  if (!armed) return <button className="button danger secondary" type="button" onClick={() => setArmed(true)}>{label}</button>;
  return <span className="confirm"><span>Are you sure?</span><button className="button danger" type="submit">Yes, delete</button><button className="button secondary" type="button" onClick={() => setArmed(false)}>Cancel</button></span>;
}

