export interface ProjectBrief {
  schemaVersion?: 2;
  id?: string;
  title?: string;
  description?: string | null;
  organisationName?: string;
  organisationType?: string | null;
  organisationContext?: string | null;
  problemStatement?: string | null;
  focusArea?: string | null;
  scope?: string | null;
  deliverables?: string | null;
  industry?: string[];
  projectType?: string;
  timeline?: number | null;
  location?: string | null;
  website?: string | null;
  technicalSkills?: string[];
  professionalSkills?: string[];
}

export type ProjectBriefSectionKind = 'markdown' | 'chips' | 'link';

export interface ProjectBriefPresentationSection {
  id: string;
  title: string;
  icon: string;
  kind: ProjectBriefSectionKind;
  value: string | string[];
  href?: string | null;
}

export interface ProjectBriefPresentation {
  title: string;
  organisationName: string;
  organisationType: string;
  sections: ProjectBriefPresentationSection[];
}

function text(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function items(value: string[] | undefined): string[] {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string' && item.trim().length > 0).map(item => item.trim())
    : [];
}

function duration(value: number | null | undefined): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '';
  }

  return `${value} ${value === 1 ? 'week' : 'weeks'}`;
}

export function safeHttpUrl(value: string | null | undefined): string | null {
  const url = text(value);
  if (!/^https?:\/\//i.test(url)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null;
  } catch {
    return null;
  }
}

export function buildProjectBriefPresentation(projectBrief: ProjectBrief | null | undefined): ProjectBriefPresentation {
  const brief = projectBrief ?? {};
  const website = text(brief.website);

  return {
    title: text(brief.title),
    organisationName: text(brief.organisationName),
    organisationType: text(brief.organisationType),
    sections: [
      { id: 'project-overview', title: $localize`:@@projectBriefProjectOverview:Project Overview`, icon: 'document-text-outline', kind: 'markdown', value: text(brief.description) },
      { id: 'scope', title: $localize`:@@projectBriefScope:Scope of Work`, icon: 'expand-outline', kind: 'markdown', value: text(brief.scope) },
      { id: 'organisational-context', title: $localize`:@@projectBriefOrganisationContext:Organisational Context`, icon: 'business-outline', kind: 'markdown', value: text(brief.organisationContext) },
      { id: 'problem-statement', title: $localize`:@@projectBriefProblemStatement:Problem Statement`, icon: 'alert-circle-outline', kind: 'markdown', value: text(brief.problemStatement) },
      { id: 'focus-area', title: $localize`:@@projectBriefFocusArea:Focus Area`, icon: 'locate-outline', kind: 'markdown', value: text(brief.focusArea) },
      { id: 'project-outcomes', title: $localize`:@@projectBriefOutcomes:Project Outcomes`, icon: 'checkbox-outline', kind: 'markdown', value: text(brief.deliverables) },
      { id: 'industry', title: $localize`:@@projectBriefIndustry:Industry`, icon: 'briefcase-outline', kind: 'chips', value: items(brief.industry) },
      { id: 'project-type', title: $localize`:@@projectBriefType:Project Type`, icon: 'layers-outline', kind: 'markdown', value: text(brief.projectType) },
      { id: 'duration', title: $localize`:@@projectBriefDuration:Duration`, icon: 'time-outline', kind: 'markdown', value: duration(brief.timeline) },
      { id: 'location', title: $localize`:@@projectBriefLocation:Location`, icon: 'location-outline', kind: 'markdown', value: text(brief.location) },
      { id: 'website', title: $localize`:@@projectBriefWebsite:Website`, icon: 'globe-outline', kind: 'link', value: website, href: safeHttpUrl(website) },
      { id: 'technical-skills', title: $localize`:@@projectBriefTechnicalSkills:Technical Skills`, icon: 'code-slash-outline', kind: 'chips', value: items(brief.technicalSkills) },
      { id: 'professional-skills', title: $localize`:@@projectBriefProfessionalSkills:Professional Skills`, icon: 'people-outline', kind: 'chips', value: items(brief.professionalSkills) },
    ],
  };
}
