'use client';
import Image from 'next/image'
import Link from 'next/link'

const illustrationStyle: React.CSSProperties = {
    animation: 'heroFloat 4s ease-in-out infinite',
    transition: 'transform 0.4s ease',
    cursor: 'default',
}


const steps = [
    { number: 1, title: 'Upload PDF', description: 'Add your book file' },
    { number: 2, title: 'AI Processing', description: 'We analyze the content' },
    { number: 3, title: 'Voice Chat', description: 'Discuss with AI' },
]

const HeroSection = () => {
    return (
        <section className='wrapper pt-10 mb-10 md:mb-16'>
            <div className="library-hero-card">
                <div className="library-hero-content">
                    {/* Left – Text + CTA */}
                    <div className="library-hero-text">
                        <h1 className="library-hero-title">Your Library</h1>
                        <p className="library-hero-description">
                            Convert your books into interactive AI conversations.<br />
                            Listen, learn, and discuss your favorite reads.
                        </p>

                        {/* Mobile illustration */}
                        <div className="library-hero-illustration">
                            <div
                                style={illustrationStyle}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06) translateY(-4px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = '')}
                            >
                                <Image
                                    src="/assets/hero-illustration.png"
                                    alt="Vintage books and globe"
                                    width={260}
                                    height={200}
                                    className="object-contain drop-shadow-md"
                                />
                            </div>
                        </div>

                        <Link href="/books/new" className="library-cta-primary">
                            <span className="text-xl">+</span>
                            Add new book
                        </Link>
                    </div>

                    {/* Center – Illustration (desktop) */}
                    <div className="library-hero-illustration-desktop">
                        <div
                            style={illustrationStyle}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06) translateY(-6px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = '')}
                        >
                            <Image
                                src="/assets/hero-illustration.png"
                                alt="Vintage books and globe"
                                width={340}
                                height={260}
                                className="object-contain drop-shadow-md"
                            />
                        </div>
                    </div>

                    {/* Float animation keyframes */}
                    <style>{`
                    @keyframes heroFloat {
                        0%, 100% { transform: translateY(0px); }
                        50%       { transform: translateY(-10px); }
                    }
                `}</style>

                    {/* Right – Steps card */}
                    <div className="library-steps-card flex flex-col gap-4 min-w-[200px]">
                        {steps.map((step, index) => (
                            <div key={step.number}>
                                <div className="library-step-item">
                                    <span className="library-step-number">{step.number}</span>
                                    <div>
                                        <p className="library-step-title">{step.title}</p>
                                        <p className="library-step-description">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <hr className="mt-4 border-[var(--border-subtle)]" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
