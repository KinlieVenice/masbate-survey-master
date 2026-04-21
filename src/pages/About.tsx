import surveyor from "@/assets/ranola-building.jpeg";
import teamRam from "@/assets/team-ram.png";
import teamRacel from "@/assets/team-racel.png";
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

      {/* Owner — featured */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container py-20 md:py-28">
          <div className="max-w-2xl mb-12 md:mb-16">
            <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Leadership</div>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-[1.1] text-balance">
              The engineer behind every plan.
            </h2>
          </div>

          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-5 lg:col-span-4">
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

      {/* Team */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">The team</div>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-tight text-balance max-w-sm">
              Working alongside Engr. Rañola.
            </h2>
          </div>
          <div className="md:col-span-7">
            <figure className="flex items-center gap-5 max-w-sm">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-sm overflow-hidden bg-secondary">
                <img
                  src={teamRam}
                  alt="Ram Cedrick A. Rañola"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <figcaption>
                <h3 className="font-serif text-lg text-foreground leading-tight">
                  Ram Cedrick A. Rañola
                </h3>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mt-2">
                  Facebook Admin Manager · Secretary
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20 md:pb-28 text-center border-t border-border pt-16 md:pt-20">
        <h2 className="font-serif text-3xl md:text-4xl mb-6 text-balance">Talk to us about your land.</h2>
        <FacebookCTA />
      </section>
    </>
  );
};

export default About;
