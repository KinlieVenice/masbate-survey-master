import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/services";
import { FacebookCTA } from "@/components/site/FacebookCTA";
import surveyor from "@/assets/ranola-building.jpeg";
import { cn } from "@/lib/utils";
import topo from "@/assets/topo-map.jpg";

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

      </section>

      <section className="relative overflow-hidden">
        {/* Background */}
        <img
          src={surveyor}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/85 to-primary/90" />

        {/* Content */}
        <div className="container relative py-16 md:py-20 flex justify-center">
          
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-8 py-10 md:px-14 md:py-10 text-center shadow-lg max-w-2xl w-full">

            <h2 className="font-serif text-foreground text-2xl md:text-3xl leading-tight mb-4">
              Not sure which service you need?
            </h2>

            <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md mx-auto">
              Send your documents and questions — we’ll guide you on the next step.
            </p>

            <FacebookCTA variant="primary" />

          </div>
        </div>
      </section>

    </>
  );
};

export default Services;
