import { CapabilityList } from '../components/CapabilityList';
import { Claim } from '../components/Claim';
import { ContactLinks } from '../components/ContactLinks';
import { PageContent } from '../sections/PageContent';

const capabilities = [
  'Agentic systems and autonomous pipelines',
  'Procedural generation for 3D and CAD',
  'Full-stack apps: web, desktop and mobile',
  'Plugins and tooling for creative software',
];

const contactLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/maxpleaner' },
  { label: 'Email', href: 'mailto:maxpleaner@gmail.com' },
];

export function TechnologyPage() {
  return (
    <PageContent label="Tech">
      <Claim caption="Software · 3D · tools · music · art">I make things with code.</Claim>
      <Claim caption="Started full-stack at small startups, then moved into 3D, CAD and manufacturing.">
        I've shipped software professionally since 2013.
      </Claim>
      <CapabilityList items={capabilities} />
      <ContactLinks links={contactLinks} />
    </PageContent>
  );
}
