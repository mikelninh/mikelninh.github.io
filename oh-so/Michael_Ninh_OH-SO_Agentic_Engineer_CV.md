# Michael Ninh

**Agentic Engineer · Applied AI · AI Product Systems**  
Berlin, Germany · available immediately  
[mikel_ninh@yahoo.de](mailto:mikel_ninh@yahoo.de) · [Portfolio](https://mikelninh.github.io/oh-so/) · [GitHub](https://github.com/mikelninh) · [LinkedIn](https://www.linkedin.com/in/michael-ninh)

## Profile

Agentic engineer and product builder focused on LLM integrations, RAG, MCP, structured outputs, evaluation harnesses, guardrails, and durable workflows. I have shipped live AI systems with verified citations, bounded agents, human approval points, prompt and cost telemetry, reusable tool infrastructure, and step-level recovery. My background combines hands-on engineering with 7+ years as a founder, product manager, and operations lead—translating ambiguous client and user needs into testable systems that teams can safely inherit.

## Core fit for OH-SO

- **AI & agents:** LLM integration, RAG, vector search, MCP, multi-agent workflows, context and memory, prompt versioning, structured outputs
- **Reliability:** evaluation harnesses, deterministic checks, guardrails, retries and backoff, idempotency, audit trails, cost and latency telemetry
- **Engineering:** Python, TypeScript, FastAPI, React, REST APIs, SQL, PostgreSQL, FAISS, Pydantic, Git, automated tests, CI/CD
- **Delivery & tooling:** Claude Code, Cursor, Codex, GitHub Actions, Vercel, Neon/Supabase, Docker, AWS ECS/Fargate, Terraform

## Selected agentic systems

### GitLaw — verified-citation RAG and MCP platform · Mar 2026–present
*Python, React, TypeScript, FAISS, BM25, MCP, FastAPI, AWS ECS/Fargate, Terraform*

- Built a live legal knowledge and workflow system indexing 5,936 German federal laws, 98,367 vectors, and a 94,178-node citation graph; a closed-beta workflow tier is in active pilot with a Berlin law firm.
- Separated retrieval, generation, and local citation verification; 53/53 hand-labelled citation cases pass in CI with structured failure modes for invalid or missing paragraphs.
- Implemented a central LLM gateway with schema validation, prompt attribution, retries with exponential backoff, token and cost tracking, and structured observability ready for external monitoring.
- [Live](https://gitlaw-xi.vercel.app/) · [Code](https://github.com/mikelninh/gitlaw)

### SafeVoice — bounded court-preparation agent · Mar 2026–present
*FastAPI, React, TypeScript, Pydantic structured outputs, PostgreSQL, LLM telemetry*

- Built an eight-tool Court-Prep Agent with max-iteration and cost limits, idempotent tool calls, run and tool audit tables, and a human checkpoint before any external send.
- Validated the classifier against 35 real cases; server-side enums constrain the legal output and schema or provider failures return visibly instead of falling back to unsafe weak classification.
- Reduced a multi-hour reporting and court-preparation workflow to roughly 30 seconds while preserving evidence hashes, prompt version, request ID, token use, cost, and review boundaries.
- [Live](https://safevoice-vert.vercel.app/) · [Code](https://github.com/mikelninh/safevoice)

### Civic AI MCP Toolkit — shared agent infrastructure · 2026
*Python package, FastMCP, CLI scaffolding, structured logging, pytest*

- Extracted repeated infrastructure from six MCP systems into one reusable package: server factory, traced tools, JSON logs, health checks, error envelopes, fixture loading, and stdio/SSE configuration.
- Shipped a one-command MCP project scaffolder and 19/19 hermetic tests, including an end-to-end CLI generation test with no model or network dependency.
- [Code](https://github.com/mikelninh/civic-ai-mcp-toolkit)

### Agent Loop Lab — durable workflow and recovery · 2026
*TypeScript, Inngest, Express, checkpoints, retries, explainable scoring*

- Built a scheduled and event-driven workflow where each step is checkpointed; on partial failure only the failed write step reruns, preventing duplicate LLM calls and duplicate tracker entries.
- Added explicit retry and `onFailure` paths plus evidence-backed job-fit scoring that maps each capability to a shipped proof project.
- [Code](https://github.com/mikelninh/agent-loop-lab)

## Professional experience

### RYUS UG — Founder & E-Commerce Manager · Berlin · Sep 2018–Mar 2025
- Built and operated an Amazon-based ecommerce business end to end across product selection, sourcing, listings, pricing, fulfilment, customer support, and marketplace performance.
- Managed several hundred monthly orders and converted recurring logistics, support, and seller-performance problems into standardised workflows and operating routines.
- Combined customer feedback, commercial constraints, and operational data to prioritise improvements and keep a small business reliable under daily real-world pressure.

### Transit Restaurants — Service & Operations Manager · Berlin · Aug 2021–Sep 2024
- Coordinated daily operations for 8+ staff, up to 150 covers per day, and parallel delivery workflows in a high-pressure service environment.
- Resolved live bottlenecks during peaks generating EUR 5,000+ in daily revenue, keeping communication, handovers, and execution stable when conditions changed quickly.
- Introduced repeatable routines that improved service consistency and made operational knowledge easier for the team to share.

### everphone GmbH — Product Manager / Business Development · Berlin · Jul 2019–Sep 2020
- Scaled ecommerce operations from zero to hundreds of units per week across Amazon, eBay, Back Market, the company website, and 5+ B2B partners.
- Worked across product positioning, partner onboarding, customer feedback, channel performance, and acquisition experiments for devices priced around EUR 200–800.
- Translated market observations and customer needs into feature priorities, channel expansion, and clearer operational requirements.

## Education

- **Masterschool Institute of Technology — AI Engineering & Software Engineering**, Oct 2025–Jun 2026. Certificate completed 8 Jun 2026; 1,600 teaching hours.
- **TU Berlin — M.Sc. Biomedical Engineering**, Oct 2016–Mar 2019. Product development, entrepreneurship, validation, go-to-market strategy, user-centred design.
- **TU Berlin — B.Sc. Mechanical Engineering**, Oct 2012–Oct 2016.

## Languages and working style

German C2 · English C1 · Vietnamese B1 · French A2 · Spanish A1

I work best in small cross-functional teams where engineers, designers, strategists, and clients can show rough work, ask questions out loud, and improve the system together. My default loop: clarify purpose and constraints, ship the smallest testable proof, evaluate before believing, document the decision, and leave reusable capability behind.
