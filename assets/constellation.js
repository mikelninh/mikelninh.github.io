(() => {
  const maps = document.querySelectorAll('[data-constellation]');

  maps.forEach((map) => {
    const filters = map.querySelectorAll('[data-constellation-filter]');
    const nodes = map.querySelectorAll('[data-constellation-node]');

    filters.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.constellationFilter;
        filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        nodes.forEach((node) => {
          const categories = (node.dataset.constellationNode || '').split(' ');
          node.dataset.dimmed = String(filter !== 'all' && !categories.includes(filter));
        });
      });
    });

    map.addEventListener('pointermove', (event) => {
      const rect = map.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      map.style.setProperty('--constellation-x', `${x}%`);
      map.style.setProperty('--constellation-y', `${y}%`);
    });
  });

  const lensRoot = document.querySelector('[data-portfolio-lens]');
  if (!lensRoot) return;

  const buttons = lensRoot.querySelectorAll('[data-lens]');
  const cards = lensRoot.querySelectorAll('[data-lens-card]');
  const summary = lensRoot.querySelector('[data-lens-summary]');

  const lenses = {
    ai: {
      copy: 'Lead with reliability and domain depth: Citizen Agents → Digital Worker Factory → GitLaw → SafeVoice → Judge MCP → Agent Loop Lab.',
      projects: ['citizen-agents', 'worker-factory', 'gitlaw', 'safevoice', 'judge', 'agent-loop']
    },
    product: {
      copy: 'Lead with usefulness and product judgement: Citizen Agents → GitLaw → SafeVoice → Atelier Engine → LuckLab → BlaKeks World.',
      projects: ['citizen-agents', 'gitlaw', 'safevoice', 'atelier', 'lucklab', 'blakeks']
    },
    creative: {
      copy: 'Lead with craft and range: BlaKeks World → Atelier Engine → LuckLab → Citizen Agents → GitLaw → SafeVoice.',
      projects: ['blakeks', 'atelier', 'lucklab', 'citizen-agents', 'gitlaw', 'safevoice']
    }
  };

  const renderLens = (lens) => {
    const config = lenses[lens];
    if (!config) return;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.lens === lens)));
    if (summary) summary.textContent = config.copy;
    cards.forEach((card) => {
      card.hidden = !config.projects.includes(card.dataset.lensCard);
    });
  };

  buttons.forEach((button) => button.addEventListener('click', () => renderLens(button.dataset.lens)));
  renderLens('ai');
})();