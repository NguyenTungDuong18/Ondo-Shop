import { ArrowLeft, Compass } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 font-sans max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 block">
          PAGE NOT FOUND / 404
        </span>
        <h1 className="font-serif-hero text-4xl sm:text-5xl text-zinc-950">
          A small detour.
        </h1>
        <p className="text-xs text-zinc-500 font-sans leading-relaxed">
          This page seems to have wandered off. Let’s get you back to the good things.
        </p>
      </div>

      <Link
        to="/"
        className="replit-btn-black px-6 py-3 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2 shadow-md cursor-pointer mt-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to the edit</span>
      </Link>
    </div>
  );
};
