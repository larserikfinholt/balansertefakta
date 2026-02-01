import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample topic
  const topic = await prisma.topic.upsert({
    where: { slug: 'klimaendringer' },
    update: {},
    create: {
      title: 'Klimaendringer',
      description: 'Diskusjoner om klimaendringer, årsaker og tiltak',
      slug: 'klimaendringer',
    },
  });

  console.log(`✓ Created topic: ${topic.title}`);

  // Create subtopic
  const subtopic = await prisma.subtopic.upsert({
    where: { topicId_slug: { topicId: topic.id, slug: 'arsaker' } },
    update: {},
    create: {
      topicId: topic.id,
      title: 'Årsaker',
      description: 'Hva forårsaker klimaendringer?',
      slug: 'arsaker',
    },
  });

  console.log(`✓ Created subtopic: ${subtopic.title}`);

  // Create question
  const question = await prisma.question.upsert({
    where: { subtopicId_slug: { subtopicId: subtopic.id, slug: 'menneskelig-aktivitet' } },
    update: {},
    create: {
      subtopicId: subtopic.id,
      title: 'Er menneskelig aktivitet hovedårsaken til global oppvarming?',
      description: 'Dette spørsmålet handler om i hvilken grad menneskelig aktivitet bidrar til global oppvarming sammenlignet med naturlige faktorer.',
      slug: 'menneskelig-aktivitet',
      status: 'OPEN',
    },
  });

  console.log(`✓ Created question: ${question.title}`);

  // Create a claim
  const claim = await prisma.claim.upsert({
    where: { id: 'seed-claim-1' },
    update: {},
    create: {
      id: 'seed-claim-1',
      statement: 'Menneskelig aktivitet er den dominerende årsaken til global oppvarming siden midten av det 20. århundre',
      context: 'Basert på IPCC AR6-rapportens konklusjoner',
      claimType: 'EMPIRICAL',
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created claim: ${claim.statement.substring(0, 50)}...`);

  // Link claim to question
  await prisma.questionClaim.upsert({
    where: { questionId_claimId: { questionId: question.id, claimId: claim.id } },
    update: {},
    create: {
      questionId: question.id,
      claimId: claim.id,
    },
  });

  // Create PRO argument
  const proArg = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-1' },
    update: {},
    create: {
      id: 'seed-arg-pro-1',
      content: 'Over 97% av klimaforskere er enige om at mennesker forårsaker global oppvarming. Dette er basert på gjennomgang av tusenvis av fagfellevurderte studier.',
      argumentType: 'PRO',
      strength: 'HIGH',
      claimId: claim.id,
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created PRO argument`);

  // Create CONTRA argument
  const contraArg = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-1' },
    update: {},
    create: {
      id: 'seed-arg-contra-1',
      content: 'Klimaet har alltid endret seg naturlig. Solaktivitet, vulkanutbrudd og naturlige sykluser som Milankovitch-syklusene har historisk drevet klimaendringer.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      claimId: claim.id,
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created CONTRA argument`);

  // Update argument counts
  await prisma.claim.update({
    where: { id: claim.id },
    data: {
      proArgumentCount: 1,
      contraArgumentCount: 1,
    },
  });

  // Create counterposition for the contra argument
  await prisma.counterposition.upsert({
    where: { id: 'seed-counter-1' },
    update: {},
    create: {
      id: 'seed-counter-1',
      argumentId: contraArg.id,
      content: 'Mens naturlige faktorer har påvirket klimaet historisk, viser forskning at den nåværende oppvarmingen skjer mye raskere enn naturlige sykluser kan forklare, og korrelerer med økte CO2-utslipp siden den industrielle revolusjonen.',
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created counterposition`);

  // Create a domain and artifact for evidence
  const domain = await prisma.domain.upsert({
    where: { hostname: 'ipcc.ch' },
    update: {},
    create: {
      hostname: 'ipcc.ch',
      name: 'IPCC',
      description: 'Intergovernmental Panel on Climate Change',
      credibilityScore: 0.95,
      credibilityNotes: 'FNs klimapanel. Sammenstiller forskning fra tusenvis av forskere globalt.',
    },
  });

  const outlet = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-ipcc' },
    update: {},
    create: {
      id: 'seed-outlet-ipcc',
      name: 'IPCC Assessment Reports',
      description: 'Hovedrapporter fra IPCC',
      domainId: domain.id,
    },
  });

  const artifact = await prisma.artifact.upsert({
    where: { url: 'https://www.ipcc.ch/report/ar6/wg1/' },
    update: {},
    create: {
      url: 'https://www.ipcc.ch/report/ar6/wg1/',
      title: 'Climate Change 2021: The Physical Science Basis',
      artifactType: 'REPORT',
      publishedAt: new Date('2021-08-09'),
      authors: ['IPCC Working Group I'],
      outletId: outlet.id,
    },
  });

  console.log(`✓ Created source: ${artifact.title}`);

  // Create extract
  const extract = await prisma.extract.upsert({
    where: { id: 'seed-extract-1' },
    update: {},
    create: {
      id: 'seed-extract-1',
      artifactId: artifact.id,
      content: 'It is unequivocal that human influence has warmed the atmosphere, ocean and land.',
      extractType: 'QUOTE',
      pageNumber: 'SPM-5',
    },
  });

  // Link evidence to pro argument
  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-1' },
    update: {},
    create: {
      id: 'seed-evidence-1',
      extractId: extract.id,
      argumentId: proArg.id,
      linkageStrength: 'DIRECT',
    },
  });

  console.log(`✓ Linked evidence to argument`);

  // Create scope for the question
  await prisma.scope.upsert({
    where: { questionId: question.id },
    update: {},
    create: {
      questionId: question.id,
      temporalScope: 'CURRENT',
      geographicScope: 'GLOBAL',
      systemBoundary: 'Global climate system and anthropogenic emissions',
      assumptions: 'Based on current scientific understanding as of IPCC AR6',
    },
  });

  console.log(`✓ Created scope for question`);

  // Create disagreement axes
  await prisma.disagreement.upsert({
    where: { id: 'seed-disagreement-1' },
    update: {},
    create: {
      id: 'seed-disagreement-1',
      questionId: question.id,
      description: 'Uenighet om hvor stor andel av oppvarmingen som skyldes menneskelig aktivitet vs naturlige faktorer',
      disagreementType: 'DATA',
    },
  });

  await prisma.disagreement.upsert({
    where: { id: 'seed-disagreement-2' },
    update: {},
    create: {
      id: 'seed-disagreement-2',
      questionId: question.id,
      description: 'Ulik tolkning av paleoklimatiske data og hva de betyr for dagens situasjon',
      disagreementType: 'INTERPRETATION',
    },
  });

  console.log(`✓ Created disagreement axes`);

  // Log events
  await prisma.event.createMany({
    data: [
      { eventType: 'create_topic', entityType: 'Topic', entityId: topic.id, payload: { title: topic.title } },
      { eventType: 'create_claim', entityType: 'Claim', entityId: claim.id, payload: { statement: claim.statement } },
      { eventType: 'add_argument', entityType: 'Argument', entityId: proArg.id, payload: { type: 'PRO' } },
      { eventType: 'add_argument', entityType: 'Argument', entityId: contraArg.id, payload: { type: 'CONTRA' } },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Logged events`);

  // Create test users
  const vegardPassword = await hashPassword('password123');
  const vegard = await prisma.user.upsert({
    where: { email: 'vegard@test.no' },
    update: {},
    create: {
      email: 'vegard@test.no',
      displayName: 'Venstre-Vegard',
      passwordHash: vegardPassword,
      authLevel: 'VERIFIED',
      contributionBudget: 20,
    },
  });

  const henrikPassword = await hashPassword('password123');
  const henrik = await prisma.user.upsert({
    where: { email: 'henrik@test.no' },
    update: {},
    create: {
      email: 'henrik@test.no',
      displayName: 'Høyre-Henrik',
      passwordHash: henrikPassword,
      authLevel: 'VERIFIED',
      contributionBudget: 20,
    },
  });

  console.log(`✓ Created test users: ${vegard.displayName}, ${henrik.displayName}`);

  console.log('\n✅ Seeding complete!');
  console.log('\nSample data created:');
  console.log(`  - Topic: ${topic.title}`);
  console.log(`  - Question: ${question.title.substring(0, 50)}...`);
  console.log(`  - Claim with balanced arguments (1 PRO, 1 CONTRA)`);
  console.log(`  - Evidence from IPCC AR6 report`);
  console.log(`  - Test users: vegard@test.no, henrik@test.no (password: password123)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
