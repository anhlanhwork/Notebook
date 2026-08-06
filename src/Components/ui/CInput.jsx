import React, { useState, useRef, useEffect } from 'react';

/**
 * Controlled input with IME composition support (Unikey / Vietnamese).
 * Buffers value locally during composition so React re-renders don't
 * interrupt mid-syllable input, then fires onChange when done.
 */
export function CInput({ value, onChange, onKeyDown, ...props }) {
  const composing = useRef(false);
  const [local, setLocal] = useState(value ?? '');

  useEffect(() => {
    if (!composing.current) setLocal(value ?? '');
  }, [value]);

  return (
    <input
      {...props}
      value={local}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={e => {
        composing.current = false;
        setLocal(e.target.value);
        onChange?.(e);
      }}
      onChange={e => {
        setLocal(e.target.value);
        if (!composing.current) onChange?.(e);
      }}
      onKeyDown={onKeyDown && (e => {
        if (!composing.current) onKeyDown(e);
      })}
    />
  );
}

/**
 * Controlled textarea with IME composition support.
 */
export function CTextarea({ value, onChange, onKeyDown, ...props }) {
  const composing = useRef(false);
  const [local, setLocal] = useState(value ?? '');

  useEffect(() => {
    if (!composing.current) setLocal(value ?? '');
  }, [value]);

  return (
    <textarea
      {...props}
      value={local}
      onCompositionStart={() => { composing.current = true; }}
      onCompositionEnd={e => {
        composing.current = false;
        setLocal(e.target.value);
        onChange?.(e);
      }}
      onChange={e => {
        setLocal(e.target.value);
        if (!composing.current) onChange?.(e);
      }}
      onKeyDown={onKeyDown && (e => {
        if (!composing.current) onKeyDown(e);
      })}
    />
  );
}
