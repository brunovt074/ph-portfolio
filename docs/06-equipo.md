# 06 · Tu equipo en Claude Code

Configuración recomendada para que Claude Code trabaje como estudio de diseño + frontend.
Instalá lo mínimo y sumá a medida que haga falta.

## Skills

| Skill | Para qué | Instalación |
|---|---|---|
| **frontend-design** (Anthropic) | Criterio visual: jerarquía, tipografía, evitar lo genérico | Marketplace oficial de plugins de Claude Code |
| **webapp-testing** (Anthropic) | QA visual con Playwright: screenshots, consola, flujos | Marketplace oficial |
| **gsap-skills** (GreenSock) | Uso correcto de GSAP y sus plugins (ScrollTrigger, SplitText, Flip) | `npx skills add https://github.com/greensock/gsap-skills` |

## Subagentes

De [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents):
`ui-designer`, `frontend-developer`, `ui-ux-tester`.

```bash
claude plugin marketplace add VoltAgent/awesome-claude-code-subagents
```

## MCPs

| MCP | Para qué |
|---|---|
| **Playwright** | Que Claude vea lo que construyó y lo corrija (screenshots a 375 / 1440 px). |
| **Context7** | Documentación actual de Astro, Sanity, GSAP, Tailwind. Evita APIs viejas. |
| **Sanity** (oficial) | Que Claude lea y escriba esquemas y contenido del CMS directamente. |

## Flujo sugerido por tarea

1. Pedile que lea `CLAUDE.md` y el doc de `docs/` que corresponda.
2. Que implemente una página o animación por vez.
3. Que la verifique con Playwright en mobile y desktop antes de darla por terminada.
4. Revisá vos los screenshots y comparalos con el canvas de Claude Design.
