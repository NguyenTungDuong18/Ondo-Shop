import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export function HomeStory() {
  return (<div className="border-t border-b border-zinc-200 dark:border-zinc-800 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
    <div className="lg:col-span-6 space-y-4">
      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">
        THE ONDA PHILOSOPHY
      </span>
      <h2 className="font-serif-hero text-4xl sm:text-5xl text-zinc-950 dark:text-zinc-100 leading-tight">
        Lived with, in all the right ways.
      </h2>
    </div>
    <div className="lg:col-span-6 space-y-3">
      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans font-normal">
        We believe a well-made object can change the temperature of a day. The weight of a cup. The drag of a pencil. The comfort of linen after its hundredth wash.
      </p>
      <div className="pt-2">
        <Link
          to="/shop"
          className="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 hover:underline uppercase tracking-wider inline-flex items-center gap-1.5"
        >
          <span>Explore our edit</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  </div>);
}
