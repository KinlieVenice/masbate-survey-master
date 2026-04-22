import surveyor from "@/assets/ranola-building.jpeg";
import teamRam from "@/assets/team-ram.png";
import teamRacel from "@/assets/engr-racel.jpg";
import teamJonalyn from "@/assets/jonalyn.jpg";
import danilo from "@/assets/danilo.jpeg";
import nelmar from "@/assets/nelmar.jpg";
import christian from "@/assets/christian.jpeg";
import jhong from "@/assets/jhong.jpeg";
import julio from "@/assets/julio.jpeg";
import { FacebookCTA } from "@/components/site/FacebookCTA";

const About = () => {
  return (
    <>
      {/* Hero */}
      <section className="container pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">About</div>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground leading-[1.05] mb-6 text-balance">
            Local roots, careful work.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Rañola Surveying Services is a Geodetic Engineering practice based in Mobo, Masbate.
            We've spent years walking the rice paddies, coastlines, and town lots of this province —
            and we treat every parcel like it matters.
          </p>
        </div>
      </section>

      {/* Approach + building image */}
      <section className="container pb-16 md:pb-24 border-t border-border pt-16 md:pt-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-7 space-y-6 text-muted-foreground leading-relaxed order-2 md:order-1">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Our approach</div>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4 text-balance">
                Field work and paperwork, done with care.
              </h2>
            </div>
            <p>
              Surveys are part field work, part paperwork. We're comfortable in both — measuring with
              modern instruments, then walking your file through DENR, LRA, CENRO, and barangay
              offices until everything is in order.
            </p>
            <p>
              We keep our clients informed at every stage. No vague timelines, no hidden steps. If
              something blocks your application, we tell you what it is and what it takes to clear it.
            </p>
            <p>
              Every plan we release is signed and sealed by a licensed Geodetic Engineer. The
              measurements are honest, the documents are complete, and the work holds up to scrutiny.
            </p>
          </div>
          <div className="md:col-span-5 order-1 md:order-2">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-elevated max-w-[200px] sm:max-w-[240px] md:max-w-none mx-auto md:ml-auto md:mr-0">
              <img src={surveyor} alt="Rañola Surveying Services office" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Owner — featured editorial */}
      <section className="relative bg-secondary/40 border-y border-border overflow-hidden">
        {/* Decorative oversized type */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-6 right-4 md:right-12 font-serif text-[120px] md:text-[220px] leading-none text-primary/5 select-none"
        >
          01
        </div>

        <div className="container relative py-20 md:py-28">
          <div className="max-w-2xl mb-12 md:mb-16">
            <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Leadership</div>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-[1.1] text-balance">
              The engineer behind every plan.
            </h2>
          </div>

          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-5 lg:col-span-4 relative">
              {/* Offset frame accent */}
              <div className="absolute -inset-3 md:-inset-4 border border-primary/30 rounded-sm translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4" />
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-deep max-w-[220px] sm:max-w-[260px] md:max-w-none mx-auto">
                <img
                  src={teamRacel}
                  alt="Racel Claire A. Rañola"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-7 lg:col-span-8 space-y-5">
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Owner · Geodetic Engineer
              </div>
              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight text-balance">
                Racel Claire A. Rañola
              </h3>
              <div className="h-px w-12 bg-primary/40" />
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg max-w-xl">
                A licensed Geodetic Engineer and the owner of Rañola Surveying Services. Every plan
                we release passes through her hands — signed, sealed, and held to the standard our
                clients have come to trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Working alongside — split editorial cards */}
      <section className="relative container py-20 md:py-28 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-2 left-2 md:left-4 font-serif text-[120px] md:text-[200px] leading-none text-primary/5 select-none"
        >
          02
        </div>

        <div className="relative max-w-2xl mb-14 md:mb-20">
          <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Working alongside</div>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-tight text-balance">
            The team behind the desk.
          </h2>
        </div>

        <div className="relative grid md:grid-cols-2 gap-x-10 lg:gap-x-20 gap-y-16 md:gap-y-0">
          {[
            {
              name: "Ram Cedrick A. Rañola",
              role: "Facebook Admin Manager · Secretary",
              pic: teamRam,
              blurb:
                "Manages our digital presence and client intake, bridging the gap between our online community and our technical surveying services.",
            },
            {
              name: "Jonalyn C. Sampaga",
              role: "Secretary",
              pic: teamJonalyn,
              blurb:
                "Optimizes office workflows and manages documentation, ensuring the administrative side of every land survey is executed flawlessly.",
            },
          ].map((m, i) => (
            <article
              key={m.name}
              className={`relative md:pt-10 ${i === 1 ? "md:mt-24" : ""}`}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 h-px w-16 bg-primary/50" />
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative h-[180px] w-[180px] sm:h-[200px] sm:w-[200px] shrink-0 rounded-sm overflow-hidden bg-secondary shadow-elevated">
                  <img
                    src={m.pic}
                    alt={m.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-serif text-2xl text-foreground leading-tight mb-2">
                    {m.name}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-4">
                    {m.role}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {m.blurb}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Survey Aids — dark band with overlapping portraits */}
      <section className="relative bg-gradient-forest text-primary-foreground overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 right-4 md:right-12 font-serif text-[120px] md:text-[220px] leading-none text-primary-foreground/5 select-none"
        >
          03
        </div>

        <div className="container relative py-20 md:py-28">
          <div className="grid md:grid-cols-12 gap-10 mb-14 md:mb-16">
            <div className="md:col-span-5">
              <div className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 mb-4">
                The field
              </div>
              <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
                Survey Aids.
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 self-end">
              <p className="text-primary-foreground/70 leading-relaxed text-sm md:text-base max-w-md">
                The hands and feet of every survey — clearing lines of sight, holding rods,
                walking boundaries with us through rain and heat.
              </p>
            </div>
          </div>

          {/* Staggered portrait strip */}
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10">
            {[
              { name: "Danilo Rañola", pic: danilo },
              { name: "Nelmar Maglente", pic: nelmar },
              { name: "Christian Viterbo", pic: christian },
              { name: "Jhong Gadayan", pic: jhong },
              { name: "Julio Rañola", pic: julio },
            ].map((member, i) => (
              <li
                key={member.name}
                className={`group ${i % 2 === 1 ? "lg:translate-y-8" : ""}`}
              >
                <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-primary-foreground/10 mb-4">
                  <img
                    src={member.pic}
                    alt={member.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
                    0{i + 1}
                  </div>
                </div>
                <h4 className="font-serif text-base md:text-lg leading-tight">
                  {member.name}
                </h4>
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50 mt-1">
                  Survey Aid
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
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
                Talk to us about your land.
              </h2>

              <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md mx-auto">
                Send your documents and questions — we’ll guide you on the next step.
              </p>

              <FacebookCTA variant="primary" />

            </div>
          </div>
        </section>

      </section>


    </>
  );
};

export default About;
