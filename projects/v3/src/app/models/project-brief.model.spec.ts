import {
  ProjectBrief,
  buildProjectBriefPresentation,
  safeHttpUrl,
} from './project-brief.model';

describe('buildProjectBriefPresentation', () => {
  it('keeps compact legacy briefs valid while presenting every supported section in order', () => {
    const legacyBrief: ProjectBrief = {
      id: 'legacy-brief',
      title: 'Legacy project',
      description: 'A compact legacy description',
      industry: ['Technology'],
      projectType: 'Research',
      technicalSkills: ['TypeScript'],
      professionalSkills: ['Communication'],
      deliverables: 'A prototype',
      timeline: 1,
    };

    const presentation = buildProjectBriefPresentation(legacyBrief);

    expect(presentation.title).toBe('Legacy project');
    expect(presentation.sections.map(section => section.title)).toEqual([
      'Project Overview',
      'Scope of Work',
      'Organisational Context',
      'Problem Statement',
      'Focus Area',
      'Project Outcomes',
      'Industry',
      'Project Type',
      'Duration',
      'Location',
      'Website',
      'Technical Skills',
      'Professional Skills',
    ]);
    expect(presentation.sections.find(section => section.id === 'project-overview')?.value)
      .toBe('A compact legacy description');
    expect(presentation.sections.find(section => section.id === 'duration')?.value).toBe('1 week');
    expect(presentation.sections.find(section => section.id === 'scope')?.value).toBe('');
  });

  it('presents every version 2 value with organisation metadata and a safe website', () => {
    const version2Brief: ProjectBrief = {
      schemaVersion: 2,
      id: 'version-2-brief',
      title: 'Circular economy initiative',
      description: 'Overview',
      organisationName: 'Example organisation',
      organisationType: 'Social enterprise',
      organisationContext: 'A regional organisation',
      problemStatement: 'Waste is increasing',
      focusArea: 'Reuse systems',
      scope: 'Research and recommend',
      deliverables: 'A delivery roadmap',
      industry: ['Sustainability'],
      projectType: 'Strategy',
      timeline: 8,
      location: 'Kuala Lumpur',
      website: 'https://example.com/project',
      technicalSkills: ['Research'],
      professionalSkills: ['Stakeholder management'],
    };

    const presentation = buildProjectBriefPresentation(version2Brief);

    expect(presentation.organisationName).toBe('Example organisation');
    expect(presentation.organisationType).toBe('Social enterprise');
    expect(presentation.sections.find(section => section.id === 'duration')?.value).toBe('8 weeks');
    expect(presentation.sections.find(section => section.id === 'website')).toEqual(jasmine.objectContaining({
      value: 'https://example.com/project',
      href: 'https://example.com/project',
    }));
  });
});

describe('safeHttpUrl', () => {
  it('accepts only absolute HTTP(S) URLs', () => {
    expect(safeHttpUrl('https://example.com')).toBe('https://example.com/');
    expect(safeHttpUrl('http://example.com/brief')).toBe('http://example.com/brief');
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('data:text/html,unsafe')).toBeNull();
    expect(safeHttpUrl('/relative-path')).toBeNull();
  });
});

describe('version 2 nullable values', () => {
  it('treats nullable text, website, and duration fields as empty presentation values', () => {
    const presentation = buildProjectBriefPresentation({
      schemaVersion: 2,
      title: 'Current project',
      description: null,
      organisationName: 'Current organisation',
      organisationType: null,
      organisationContext: null,
      problemStatement: null,
      focusArea: null,
      scope: null,
      deliverables: null,
      projectType: 'Research',
      timeline: null,
      location: null,
      website: null,
    });

    expect(presentation.title).toBe('Current project');
    expect(presentation.organisationName).toBe('Current organisation');
    expect(presentation.organisationType).toBe('');
    [
      'project-overview',
      'scope',
      'organisational-context',
      'problem-statement',
      'focus-area',
      'project-outcomes',
      'duration',
      'location',
      'website',
    ].forEach(id => expect(presentation.sections.find(section => section.id === id)?.value).toBe(''));
    expect(presentation.sections.find(section => section.id === 'website')?.href).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
  });
});
