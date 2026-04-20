import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/services";
import { FacebookCTA } from "@/components/site/FacebookCTA";
import { cn } from "@/lib/utils";

const Services = () => {
  return (
    <>
      <section className="container pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Services</div>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground leading-[1.05] mb-6 text-balance">
            Survey work, prepared properly.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            From single-lot relocation to multi-parcel subdivision — every job is signed and sealed
            by a licensed Geodetic Engineer.
          </p>
        </div>
      </section>

      <section className="container pb-20 md:pb-28">
        <div className="grid md:grid-cols-2 gap-px bg-border rounded-sm overflow-hidden shadow-soft">
          {SERVICES.map((s, i) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className={cn(
                "group bg-card p-8 md:p-10 hover:bg-secondary/40 transition-colors duration-300 ease-natural",
                i === SERVICES.length - 1 && SERVICES.length % 2 === 1 && "md:col-span-2"
              )}
            >
              <div className="flex items-baseline justify-between mb-4 gap-4">
                <h2 className="font-serif text-2xl md:text-3xl text-foreground">{s.name}</h2>
                <ArrowRight className="h-5 w-5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">{s.short}</p>
              <div className="flex flex-wrap gap-2">
                {s.uses.slice(0, 3).map((u) => (
                  <span
                    key={u}
                    className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-sm bg-secondary text-secondary-foreground"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Not sure which survey you need?</p>
          <FacebookCTA label="Ask us on Facebook" />
        </div>
      </section>
    </>
  );
};

export default Services;
