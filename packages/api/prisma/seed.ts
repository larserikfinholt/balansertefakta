/// <reference types="node" />

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

  // Create a second sample topic
  const topic2 = await prisma.topic.upsert({
    where: { slug: 'energipolitikk' },
    update: {},
    create: {
      title: 'Energipolitikk',
      description: 'Diskusjoner om energimiks, forsyningssikkerhet og utslippskutt',
      slug: 'energipolitikk',
    },
  });

  console.log(`✓ Created topic: ${topic2.title}`);

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

  // Create second climate subtopic
  const climateSubtopicMeasures = await prisma.subtopic.upsert({
    where: { topicId_slug: { topicId: topic.id, slug: 'tiltak' } },
    update: {},
    create: {
      topicId: topic.id,
      title: 'Tiltak',
      description: 'Mulige klimatiltak og virkemidler',
      slug: 'tiltak',
    },
  });

  console.log(`✓ Created subtopic: ${climateSubtopicMeasures.title}`);

  // Create second subtopic
  const subtopic2 = await prisma.subtopic.upsert({
    where: { topicId_slug: { topicId: topic2.id, slug: 'kjernekraft' } },
    update: {},
    create: {
      topicId: topic2.id,
      title: 'Kjernekraft',
      description: 'Rolle for kjernekraft i norsk energimiks',
      slug: 'kjernekraft',
    },
  });

  console.log(`✓ Created subtopic: ${subtopic2.title}`);

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

  // Create second question
  const question2 = await prisma.question.upsert({
    where: { subtopicId_slug: { subtopicId: subtopic2.id, slug: 'nye-kjernekraftverk' } },
    update: {},
    create: {
      subtopicId: subtopic2.id,
      title: 'Bør Norge bygge nye kjernekraftverk?',
      description: 'Vurdering av kjernekraft som del av en lavutslipps energimiks i Norge.',
      slug: 'nye-kjernekraftverk',
      status: 'OPEN',
    },
  });

  console.log(`✓ Created question: ${question2.title}`);

  // Create third question (climate measures)
  const question3 = await prisma.question.upsert({
    where: { subtopicId_slug: { subtopicId: climateSubtopicMeasures.id, slug: 'co2-avgift' } },
    update: {},
    create: {
      subtopicId: climateSubtopicMeasures.id,
      title: 'Bør Norge øke CO₂-avgiften ytterligere?',
      description: 'Diskusjon om karbonprising som virkemiddel: effekt, kostnad og fordeling.',
      slug: 'co2-avgift',
      status: 'OPEN',
    },
  });

  console.log(`✓ Created question: ${question3.title}`);

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

  // Create a second claim
  const claim2 = await prisma.claim.upsert({
    where: { id: 'seed-claim-2' },
    update: {},
    create: {
      id: 'seed-claim-2',
      statement: 'Kjernekraft kan levere stabil kraft med lave utslipp i norsk kraftsystem',
      context: 'Påstanden gjelder driftseffekter og forsyningssikkerhet sammenlignet med andre alternativer.',
      claimType: 'CAUSAL',
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created claim: ${claim2.statement.substring(0, 50)}...`);

  // Create third claim (CO2 trend / attribution)
  const claim3 = await prisma.claim.upsert({
    where: { id: 'seed-claim-3' },
    update: {},
    create: {
      id: 'seed-claim-3',
      statement: 'Atmosfærisk CO₂ har økt kraftig i moderne tid, og hovedforklaringen er menneskeskapte utslipp',
      context: 'Påstanden gjelder langsiktig trend og dominerende årsak, ikke kortsiktig naturlig variasjon.',
      claimType: 'CAUSAL',
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created claim: ${claim3.statement.substring(0, 50)}...`);

  // Create fourth claim (nuclear project risk)
  const claim4 = await prisma.claim.upsert({
    where: { id: 'seed-claim-4' },
    update: {},
    create: {
      id: 'seed-claim-4',
      statement: 'Nye kjernekraftprosjekter har ofte høy kostnads- og tidsrisiko sammenlignet med alternative krafttiltak',
      context: 'Påstanden gjelder typiske prosjektrisikoer (byggetid, finansiering, usikkerhet), ikke nødvendigvis sikker drift når anlegget først er bygget.',
      claimType: 'EMPIRICAL',
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created claim: ${claim4.statement.substring(0, 50)}...`);

  // Create fifth claim (carbon pricing effectiveness)
  const claim5 = await prisma.claim.upsert({
    where: { id: 'seed-claim-5' },
    update: {},
    create: {
      id: 'seed-claim-5',
      statement: 'Karbonprising kan være et kostnadseffektivt virkemiddel for å redusere utslipp, gitt god utforming',
      context: 'Påstanden handler om virkemiddeldesign (forutsigbarhet, bred dekning, tilbakeføring/kompensasjon) og tar høyde for fordelingsvirkninger.',
      claimType: 'CAUSAL',
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created claim: ${claim5.statement.substring(0, 50)}...`);

  // Link claim to question
  await prisma.questionClaim.upsert({
    where: { questionId_claimId: { questionId: question.id, claimId: claim.id } },
    update: {},
    create: {
      questionId: question.id,
      claimId: claim.id,
    },
  });

  // Link second claim to second question
  await prisma.questionClaim.upsert({
    where: { questionId_claimId: { questionId: question2.id, claimId: claim2.id } },
    update: {},
    create: {
      questionId: question2.id,
      claimId: claim2.id,
    },
  });

  // Link additional claims to questions
  await prisma.questionClaim.upsert({
    where: { questionId_claimId: { questionId: question.id, claimId: claim3.id } },
    update: {},
    create: {
      questionId: question.id,
      claimId: claim3.id,
    },
  });

  await prisma.questionClaim.upsert({
    where: { questionId_claimId: { questionId: question2.id, claimId: claim4.id } },
    update: {},
    create: {
      questionId: question2.id,
      claimId: claim4.id,
    },
  });

  await prisma.questionClaim.upsert({
    where: { questionId_claimId: { questionId: question3.id, claimId: claim5.id } },
    update: {},
    create: {
      questionId: question3.id,
      claimId: claim5.id,
    },
  });

  // Create PRO argument
  const proArg = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-1' },
    update: {},
    create: {
      id: 'seed-arg-pro-1',
      content: 'IPCC oppsummerer at menneskelig påvirkning har varmet atmosfære, hav og land, og at dette er en hoveddriver for observert oppvarming i moderne tid.',
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
      content: 'Naturlige faktorer og intern variabilitet påvirker klimaet, og både vulkansk aktivitet, havsykluser og naturlige svingninger kan bidra til kortsiktige endringer og regionale mønstre.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      claimId: claim.id,
      status: 'ACCEPTED',
    },
  });

  console.log(`✓ Created CONTRA argument`);

  // Create PRO argument for claim2
  const proArg2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-2' },
    update: {},
    create: {
      id: 'seed-arg-pro-2',
      content: 'Kjernekraft gir stabil, regulerbar produksjon med lave livsløpsutslipp, noe som kan styrke forsyningssikkerheten når andelen variabel kraft øker.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      claimId: claim2.id,
      status: 'ACCEPTED',
    },
  });

  // Create CONTRA argument for claim2
  const contraArg2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-2' },
    update: {},
    create: {
      id: 'seed-arg-contra-2',
      content: 'Kjernekraft er kapitalkrevende og har lange byggetider, noe som gjør den mindre egnet for raske utslippskutt og fleksibilitet i det norske kraftsystemet.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      claimId: claim2.id,
      status: 'ACCEPTED',
    },
  });

  // More arguments for claim1 (climate attribution)
  const proArg3 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-5' },
    update: {},
    create: {
      id: 'seed-arg-pro-5',
      content: 'Oppvarmingsmønstre i atmosfæren (inkludert avkjøling i stratosfæren) er konsistente med økt drivhuseffekt og mindre konsistente med økt solinnstråling som hovedforklaring.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      claimId: claim.id,
      status: 'ACCEPTED',
    },
  });

  const proArg4 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-6' },
    update: {},
    create: {
      id: 'seed-arg-pro-6',
      content: 'Økt varmeinnhold i havet støtter at klimasystemet akkumulerer energi over tid, noe som er forventet ved økt strålingspådriv fra drivhusgasser.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      claimId: claim.id,
      status: 'ACCEPTED',
    },
  });

  const contraArg3 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-5' },
    update: {},
    create: {
      id: 'seed-arg-contra-5',
      content: 'Usikkerhet i styrken til noen klimadrivere (for eksempel aerosoler) og i noen tilbakekoblinger (for eksempel skyer) kan påvirke hvor presist man kan anslå størrelsen på menneskelig bidrag i detaljer.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      claimId: claim.id,
      status: 'ACCEPTED',
    },
  });

  const contraArg4 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-6' },
    update: {},
    create: {
      id: 'seed-arg-contra-6',
      content: 'Kortere perioder kan vise svakere eller sterkere oppvarming på grunn av intern variabilitet, noe som gjør at enkelte oppfatter trendene som mindre entydige uten å se på lange tidsserier.',
      argumentType: 'CONTRA',
      strength: 'LOW',
      claimId: claim.id,
      status: 'ACCEPTED',
    },
  });

  // Arguments for claim3 (CO2 increase / cause)
  const co2Pro1 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-7' },
    update: {},
    create: {
      id: 'seed-arg-pro-7',
      content: 'Måleserier av atmosfærisk CO₂ viser en tydelig langsiktig økning, og dette sammenfaller med menneskeskapte utslipp fra fossil energi og endret arealbruk.',
      argumentType: 'PRO',
      strength: 'HIGH',
      claimId: claim3.id,
      status: 'ACCEPTED',
    },
  });

  const co2Pro2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-8' },
    update: {},
    create: {
      id: 'seed-arg-pro-8',
      content: 'Karbonkretsløpet har store naturlige fluxer, men den vedvarende oppadgående trenden over tiår forklares best når menneskelige utslipp inngår i regnskapet.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      claimId: claim3.id,
      status: 'ACCEPTED',
    },
  });

  const co2Contra1 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-7' },
    update: {},
    create: {
      id: 'seed-arg-contra-7',
      content: 'CO₂ varierer også naturlig, og regionale/årlige variasjoner i opptak og utslipp fra hav og biosfære kan gjøre årsaksbildet mindre intuitivt uten kontekst.',
      argumentType: 'CONTRA',
      strength: 'LOW',
      claimId: claim3.id,
      status: 'ACCEPTED',
    },
  });

  const co2Contra2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-8' },
    update: {},
    create: {
      id: 'seed-arg-contra-8',
      content: 'Det kan være uenighet om hvor stor andel av økningen som skyldes fossil energi versus endret arealbruk og andre menneskelige kilder, selv om totalbildet er menneskedrevet.',
      argumentType: 'CONTRA',
      strength: 'LOW',
      claimId: claim3.id,
      status: 'ACCEPTED',
    },
  });

  // More arguments for claim2 (nuclear in power system)
  const nuclearPro2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-9' },
    update: {},
    create: {
      id: 'seed-arg-pro-9',
      content: 'Kjernekraft har ofte høy kapasitetsfaktor og kan levere stabil effekt over lange perioder, som kan redusere behovet for fossile reservekraftverk.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      claimId: claim2.id,
      status: 'ACCEPTED',
    },
  });

  const nuclearPro3 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-10' },
    update: {},
    create: {
      id: 'seed-arg-pro-10',
      content: 'I et elektrifiseringsscenario kan stabil produksjon bidra til å dempe prisvolatilitet i perioder med lite vind/sol, dersom kostnader og leveransetid håndteres.',
      argumentType: 'PRO',
      strength: 'LOW',
      claimId: claim2.id,
      status: 'ACCEPTED',
    },
  });

  const nuclearContra2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-9' },
    update: {},
    create: {
      id: 'seed-arg-contra-9',
      content: 'Avfallsforvaltning, institusjonell kapasitet og langsiktig samfunnstillit er krevende, og kan være en praktisk begrensning selv om tekniske løsninger finnes.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      claimId: claim2.id,
      status: 'ACCEPTED',
    },
  });

  const nuclearContra3 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-10' },
    update: {},
    create: {
      id: 'seed-arg-contra-10',
      content: 'Selv med lav sannsynlighet kan ulykker ha høy konsekvens og påvirke aksept, regulering og kostnader, noe som kan gjøre teknologien politisk og økonomisk sårbar.',
      argumentType: 'CONTRA',
      strength: 'LOW',
      claimId: claim2.id,
      status: 'ACCEPTED',
    },
  });

  // Arguments for claim4 (nuclear project risk)
  const riskPro1 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-11' },
    update: {},
    create: {
      id: 'seed-arg-pro-11',
      content: 'Kjernekraftprosjekter er kapitalkrevende og sensitive for finansieringskostnader; forsinkelser kan øke total kostnad betydelig og gi høy risiko for budsjettoverskridelser.',
      argumentType: 'PRO',
      strength: 'HIGH',
      claimId: claim4.id,
      status: 'ACCEPTED',
    },
  });

  const riskContra1 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-11' },
    update: {},
    create: {
      id: 'seed-arg-contra-11',
      content: 'Prosjektrisiko varierer mellom land og kontraktstyper, og standardiserte design, læringseffekter og bedre prosjektstyring kan redusere risiko over tid.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      claimId: claim4.id,
      status: 'ACCEPTED',
    },
  });

  const riskContra2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-12' },
    update: {},
    create: {
      id: 'seed-arg-contra-12',
      content: 'Sammenligning med alternativer kan avhenge av systemkostnader (nett, balanse, lagring). Det er derfor ikke alltid gitt at andre tiltak gir lavere totalrisiko i et helhetlig system.',
      argumentType: 'CONTRA',
      strength: 'LOW',
      claimId: claim4.id,
      status: 'ACCEPTED',
    },
  });

  // Arguments for claim5 (carbon pricing)
  const pricingPro1 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-12' },
    update: {},
    create: {
      id: 'seed-arg-pro-12',
      content: 'Karbonprising gir et generelt insentiv til å redusere utslipp der det er billigst, og kan dermed redusere kostnaden ved å nå et gitt utslippsmål.',
      argumentType: 'PRO',
      strength: 'HIGH',
      claimId: claim5.id,
      status: 'ACCEPTED',
    },
  });

  const pricingPro2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-13' },
    update: {},
    create: {
      id: 'seed-arg-pro-13',
      content: 'Inntektene fra karbonprising kan brukes til å kompensere husholdninger eller redusere andre skatter, som kan bedre politisk gjennomførbarhet og fordelingsprofil.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      claimId: claim5.id,
      status: 'ACCEPTED',
    },
  });

  const pricingContra1 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-13' },
    update: {},
    create: {
      id: 'seed-arg-contra-13',
      content: 'Karbonprising kan gi økte levekostnader og fordelingsutfordringer dersom kompensasjon og omstillingstiltak ikke er godt nok utformet.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      claimId: claim5.id,
      status: 'ACCEPTED',
    },
  });

  const pricingContra2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-14' },
    update: {},
    create: {
      id: 'seed-arg-contra-14',
      content: 'For enkelte sektorer kan pris alene være utilstrekkelig på kort sikt (teknologiske barrierer, regulering), og virkemiddelet må ofte kombineres med standarder, investeringer og infrastruktur.',
      argumentType: 'CONTRA',
      strength: 'LOW',
      claimId: claim5.id,
      status: 'ACCEPTED',
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

  await prisma.counterposition.upsert({
    where: { id: 'seed-counter-2' },
    update: {},
    create: {
      id: 'seed-counter-2',
      argumentId: contraArg2.id,
      content: 'Selv om byggetid og kostnad er utfordringer, kan standardiserte design og langsiktige kraftbehov gjøre kjernekraft konkurransedyktig for stabil lavutslippskraft.',
      status: 'ACCEPTED',
    },
  });

  // Counterpositions for new contra arguments (steelman)
  await prisma.counterposition.upsert({
    where: { id: 'seed-counter-3' },
    update: {},
    create: {
      id: 'seed-counter-3',
      argumentId: contraArg3.id,
      content: 'Usikkerheter finnes, men det kan fortsatt være mulig å konkludere om dominerende årsak på aggregert nivå når mange uavhengige indikatorer peker i samme retning.',
      status: 'ACCEPTED',
    },
  });

  await prisma.counterposition.upsert({
    where: { id: 'seed-counter-4' },
    update: {},
    create: {
      id: 'seed-counter-4',
      argumentId: contraArg4.id,
      content: 'Korttidsvariabilitet kan maskere trend midlertidig, men langsiktige serier og flere datasett viser en vedvarende oppvarmingstrend som er robust på tvers av metoder.',
      status: 'ACCEPTED',
    },
  });

  await prisma.counterposition.upsert({
    where: { id: 'seed-counter-5' },
    update: {},
    create: {
      id: 'seed-counter-5',
      argumentId: co2Contra1.id,
      content: 'Naturlige variasjoner påvirker år-til-år, men det endrer ikke at langsiktig trend og massebalanse peker mot at menneskelige utslipp er den dominerende driveren for økningen.',
      status: 'ACCEPTED',
    },
  });

  await prisma.counterposition.upsert({
    where: { id: 'seed-counter-6' },
    update: {},
    create: {
      id: 'seed-counter-6',
      argumentId: riskContra1.id,
      content: 'Selv om risiko kan reduseres, er det fortsatt relevant å vurdere om dagens institusjoner og markedsdesign faktisk leverer denne risikoreduksjonen i praksis.',
      status: 'ACCEPTED',
    },
  });

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

  // Additional climate sources
  const domainNasa = await prisma.domain.upsert({
    where: { hostname: 'climate.nasa.gov' },
    update: {},
    create: {
      hostname: 'climate.nasa.gov',
      name: 'NASA Global Climate Change',
      description: 'NASA sitt formidlings- og datagrunnlag om klima',
      credibilityScore: 0.9,
      credibilityNotes: 'Offisiell NASA-ressurs som peker til underliggende datasett og forskning.',
    },
  });

  const outletNasa = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-nasa' },
    update: {},
    create: {
      id: 'seed-outlet-nasa',
      name: 'NASA Climate',
      description: 'NASA Global Climate Change',
      domainId: domainNasa.id,
    },
  });

  const artifactNasaEvidence = await prisma.artifact.upsert({
    where: { url: 'https://climate.nasa.gov/evidence/' },
    update: {},
    create: {
      url: 'https://climate.nasa.gov/evidence/',
      title: 'Evidence',
      artifactType: 'OFFICIAL_DOCUMENT',
      authors: ['NASA'],
      outletId: outletNasa.id,
    },
  });

  const extractNasaEvidence = await prisma.extract.upsert({
    where: { id: 'seed-extract-5' },
    update: {},
    create: {
      id: 'seed-extract-5',
      artifactId: artifactNasaEvidence.id,
      content: 'NASA oppsummerer flere uavhengige indikatorer (temperatur, havnivå, is, havvarme) som samlet peker på en pågående global oppvarmingstrend.',
      extractType: 'PARAPHRASE',
    },
  });

  const domainNoaaGml = await prisma.domain.upsert({
    where: { hostname: 'gml.noaa.gov' },
    update: {},
    create: {
      hostname: 'gml.noaa.gov',
      name: 'NOAA Global Monitoring Laboratory',
      description: 'Atmosfæriske målinger og tidsserier (bl.a. CO₂)',
      credibilityScore: 0.9,
      credibilityNotes: 'Offisiell NOAA-ressurs for måledata.',
    },
  });

  const outletNoaa = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-noaa-gml' },
    update: {},
    create: {
      id: 'seed-outlet-noaa-gml',
      name: 'NOAA GML',
      description: 'Global Monitoring Laboratory',
      domainId: domainNoaaGml.id,
    },
  });

  const artifactNoaaCo2 = await prisma.artifact.upsert({
    where: { url: 'https://gml.noaa.gov/ccgg/trends/' },
    update: {},
    create: {
      url: 'https://gml.noaa.gov/ccgg/trends/',
      title: 'Trends in Atmospheric Carbon Dioxide',
      artifactType: 'OFFICIAL_DOCUMENT',
      authors: ['NOAA'],
      outletId: outletNoaa.id,
    },
  });

  const extractNoaaCo2 = await prisma.extract.upsert({
    where: { id: 'seed-extract-6' },
    update: {},
    create: {
      id: 'seed-extract-6',
      artifactId: artifactNoaaCo2.id,
      content: 'NOAA publiserer løpende måleserier som viser en langsiktig økning i atmosfærisk CO₂.',
      extractType: 'PARAPHRASE',
    },
  });

  const domainNoaaNcei = await prisma.domain.upsert({
    where: { hostname: 'www.ncei.noaa.gov' },
    update: {},
    create: {
      hostname: 'www.ncei.noaa.gov',
      name: 'NOAA NCEI',
      description: 'National Centers for Environmental Information',
      credibilityScore: 0.9,
      credibilityNotes: 'Offisiell NOAA-ressurs for klimaindikatorer og datasett.',
    },
  });

  const outletNoaaNcei = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-noaa-ncei' },
    update: {},
    create: {
      id: 'seed-outlet-noaa-ncei',
      name: 'NOAA NCEI',
      description: 'Klimaindikatorer og datasett',
      domainId: domainNoaaNcei.id,
    },
  });

  const artifactOceanHeat = await prisma.artifact.upsert({
    where: { url: 'https://www.ncei.noaa.gov/access/monitoring/ocean-heat-content/' },
    update: {},
    create: {
      url: 'https://www.ncei.noaa.gov/access/monitoring/ocean-heat-content/',
      title: 'Ocean Heat Content',
      artifactType: 'OFFICIAL_DOCUMENT',
      authors: ['NOAA'],
      outletId: outletNoaaNcei.id,
    },
  });

  const extractOceanHeat = await prisma.extract.upsert({
    where: { id: 'seed-extract-7' },
    update: {},
    create: {
      id: 'seed-extract-7',
      artifactId: artifactOceanHeat.id,
      content: 'NOAA presenterer indikatorer for havets varmeinnhold som viser langsiktige endringer i energilagring i havet.',
      extractType: 'PARAPHRASE',
    },
  });

  // IPCC WG3 (mitigation) for policy context
  const artifactWg3 = await prisma.artifact.upsert({
    where: { url: 'https://www.ipcc.ch/report/ar6/wg3/' },
    update: {},
    create: {
      url: 'https://www.ipcc.ch/report/ar6/wg3/',
      title: 'Climate Change 2022: Mitigation of Climate Change',
      artifactType: 'REPORT',
      publishedAt: new Date('2022-04-04'),
      authors: ['IPCC Working Group III'],
      outletId: outlet.id,
    },
  });

  const extractWg3Pricing = await prisma.extract.upsert({
    where: { id: 'seed-extract-8' },
    update: {},
    create: {
      id: 'seed-extract-8',
      artifactId: artifactWg3.id,
      content: 'IPCC omtaler karbonprising som et av flere virkemidler som kan bidra til utslippsreduksjoner, spesielt når det kombineres med andre tiltak og god policyutforming.',
      extractType: 'PARAPHRASE',
    },
  });

  // Additional nuclear lifecycle source
  const domainUnece = await prisma.domain.upsert({
    where: { hostname: 'unece.org' },
    update: {},
    create: {
      hostname: 'unece.org',
      name: 'UNECE',
      description: 'United Nations Economic Commission for Europe',
      credibilityScore: 0.85,
      credibilityNotes: 'FN-organ som publiserer analyser, inkludert energisystemstudier.',
    },
  });

  const outletUnece = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-unece' },
    update: {},
    create: {
      id: 'seed-outlet-unece',
      name: 'UNECE Reports',
      description: 'Rapporter fra UNECE',
      domainId: domainUnece.id,
    },
  });

  const artifactUneceLca = await prisma.artifact.upsert({
    where: { url: 'https://unece.org/sed/documents/2021/10/reports/life-cycle-assessment-electricity-generation-options' },
    update: {},
    create: {
      url: 'https://unece.org/sed/documents/2021/10/reports/life-cycle-assessment-electricity-generation-options',
      title: 'Life Cycle Assessment of Electricity Generation Options',
      artifactType: 'REPORT',
      publishedAt: new Date('2021-10-01'),
      authors: ['UNECE'],
      outletId: outletUnece.id,
    },
  });

  const extractUneceLca = await prisma.extract.upsert({
    where: { id: 'seed-extract-10' },
    update: {},
    create: {
      id: 'seed-extract-10',
      artifactId: artifactUneceLca.id,
      content: 'UNECE omtaler kjernekraft som en lavutslipps-teknologi i et livsløpsperspektiv sammenlignet med fossile alternativer.',
      extractType: 'PARAPHRASE',
    },
  });

  const domainIea = await prisma.domain.upsert({
    where: { hostname: 'iea.org' },
    update: {},
    create: {
      hostname: 'iea.org',
      name: 'IEA',
      description: 'International Energy Agency',
      credibilityScore: 0.9,
      credibilityNotes: 'Internasjonal energi- og klimapolitisk analyse.',
    },
  });

  const outletIea = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-iea' },
    update: {},
    create: {
      id: 'seed-outlet-iea',
      name: 'IEA Reports',
      description: 'Rapporter fra IEA',
      domainId: domainIea.id,
    },
  });

  const artifactIea = await prisma.artifact.upsert({
    where: { url: 'https://www.iea.org/reports/nuclear-power-in-a-clean-energy-system' },
    update: {},
    create: {
      url: 'https://www.iea.org/reports/nuclear-power-in-a-clean-energy-system',
      title: 'Nuclear Power in a Clean Energy System',
      artifactType: 'REPORT',
      publishedAt: new Date('2019-05-10'),
      authors: ['International Energy Agency'],
      outletId: outletIea.id,
    },
  });

  const extractIea = await prisma.extract.upsert({
    where: { id: 'seed-extract-2' },
    update: {},
    create: {
      id: 'seed-extract-2',
      artifactId: artifactIea.id,
      content: 'IEA beskriver kjernekraft som en kilde til fast, lavkarbon kraft som kan støtte avkarbonisering av kraftsystemer.',
      extractType: 'PARAPHRASE',
    },
  });

  const domainOecd = await prisma.domain.upsert({
    where: { hostname: 'oecd-nea.org' },
    update: {},
    create: {
      hostname: 'oecd-nea.org',
      name: 'OECD/NEA',
      description: 'Nuclear Energy Agency',
      credibilityScore: 0.85,
      credibilityNotes: 'Internasjonal faginstans for kjernekraft',
    },
  });

  const outletOecd = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-nea' },
    update: {},
    create: {
      id: 'seed-outlet-nea',
      name: 'NEA Reports',
      description: 'Rapporter fra OECD NEA',
      domainId: domainOecd.id,
    },
  });

  const artifactOecd = await prisma.artifact.upsert({
    where: { url: 'https://www.oecd-nea.org/jcms/pl_51110/projected-costs-of-generating-electricity-2020-edition' },
    update: {},
    create: {
      url: 'https://www.oecd-nea.org/jcms/pl_51110/projected-costs-of-generating-electricity-2020-edition',
      title: 'Projected Costs of Generating Electricity 2020',
      artifactType: 'REPORT',
      publishedAt: new Date('2020-12-01'),
      authors: ['OECD NEA', 'IEA'],
      outletId: outletOecd.id,
    },
  });

  const extractOecd = await prisma.extract.upsert({
    where: { id: 'seed-extract-3' },
    update: {},
    create: {
      id: 'seed-extract-3',
      artifactId: artifactOecd.id,
      content: 'Rapporten fremhever at kjernekraftprosjekter er kapitalkrevende og at byggetid og finansieringskostnader påvirker total kostnad betydelig.',
      extractType: 'PARAPHRASE',
    },
  });

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

  // Additional extracts from the same IPCC WG1 artifact
  const extractIpccOcean = await prisma.extract.upsert({
    where: { id: 'seed-extract-9' },
    update: {},
    create: {
      id: 'seed-extract-9',
      artifactId: artifact.id,
      content: 'IPCC oppsummerer at tempo og omfang i nylig oppvarming skiller seg ut i et langt historisk perspektiv, basert på flere uavhengige klimadata.',
      extractType: 'PARAPHRASE',
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

  // Evidence links for additional climate arguments
  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-5' },
    update: {},
    create: {
      id: 'seed-evidence-5',
      extractId: extractOceanHeat.id,
      argumentId: proArg4.id,
      linkageStrength: 'INDIRECT',
    },
  });

  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-6' },
    update: {},
    create: {
      id: 'seed-evidence-6',
      extractId: extractNasaEvidence.id,
      argumentId: proArg3.id,
      linkageStrength: 'CONSISTENT_WITH',
    },
  });

  // Evidence links for CO2 claim
  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-7' },
    update: {},
    create: {
      id: 'seed-evidence-7',
      extractId: extractNoaaCo2.id,
      argumentId: co2Pro1.id,
      linkageStrength: 'DIRECT',
    },
  });

  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-9' },
    update: {},
    create: {
      id: 'seed-evidence-9',
      extractId: extractWg3Pricing.id,
      argumentId: pricingPro2.id,
      linkageStrength: 'CONSISTENT_WITH',
    },
  });

  // Link evidence to claim2 arguments
  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-2' },
    update: {},
    create: {
      id: 'seed-evidence-2',
      extractId: extractIea.id,
      argumentId: proArg2.id,
      linkageStrength: 'INDIRECT',
    },
  });

  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-11' },
    update: {},
    create: {
      id: 'seed-evidence-11',
      extractId: extractUneceLca.id,
      argumentId: proArg2.id,
      linkageStrength: 'CONSISTENT_WITH',
    },
  });

  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-3' },
    update: {},
    create: {
      id: 'seed-evidence-3',
      extractId: extractOecd.id,
      argumentId: contraArg2.id,
      linkageStrength: 'INDIRECT',
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

  await prisma.scope.upsert({
    where: { questionId: question3.id },
    update: {},
    create: {
      questionId: question3.id,
      temporalScope: 'SHORT_TERM',
      geographicScope: 'NATIONAL',
      systemBoundary: 'Norwegian economy and emissions policy',
      assumptions: 'Fokus på policyutforming og praktisk gjennomføring.',
    },
  });

  console.log(`✓ Created scope for question`);

  await prisma.scope.upsert({
    where: { questionId: question2.id },
    update: {},
    create: {
      questionId: question2.id,
      temporalScope: 'SHORT_TERM',
      geographicScope: 'NATIONAL',
      systemBoundary: 'Norwegian power system and future demand growth',
      assumptions: 'Antar fortsatt elektrifisering og mål om lave utslipp.',
    },
  });

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
    where: { id: 'seed-disagreement-5' },
    update: {},
    create: {
      id: 'seed-disagreement-5',
      questionId: question3.id,
      description: 'Uenighet om effekt av karbonprising versus andre virkemidler, og om riktig nivå og tempo',
      disagreementType: 'INTERPRETATION',
    },
  });

  await prisma.disagreement.upsert({
    where: { id: 'seed-disagreement-6' },
    update: {},
    create: {
      id: 'seed-disagreement-6',
      questionId: question3.id,
      description: 'Uenighet om fordelingsvirkninger og rettferdighet: hvem bærer kostnaden og hvordan kompenseres?',
      disagreementType: 'VALUES_OR_RISK',
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

  await prisma.disagreement.upsert({
    where: { id: 'seed-disagreement-3' },
    update: {},
    create: {
      id: 'seed-disagreement-3',
      questionId: question2.id,
      description: 'Uenighet om kostnads- og tidsrisiko sammenlignet med alternative tiltak',
      disagreementType: 'INTERPRETATION',
    },
  });

  await prisma.disagreement.upsert({
    where: { id: 'seed-disagreement-4' },
    update: {},
    create: {
      id: 'seed-disagreement-4',
      questionId: question2.id,
      description: 'Uenighet om verdier knyttet til energisikkerhet vs naturinngrep og avfallsrisiko',
      disagreementType: 'VALUES_OR_RISK',
    },
  });

  // Create measures
  const measure1 = await prisma.measure.upsert({
    where: { id: 'seed-measure-1' },
    update: {},
    create: {
      id: 'seed-measure-1',
      title: 'Demonstrasjonsanlegg for SMR innen 2035',
      description: 'Utrede og etablere et demonstrasjonsanlegg for små modulære reaktorer (SMR) i Norge innen 2035.',
      rationale: 'Skal gi erfaring med teknologi, kostnad og sikkerhet før eventuell skalering.',
      status: 'ACCEPTED',
    },
  });

  await prisma.questionMeasure.upsert({
    where: { questionId_measureId: { questionId: question2.id, measureId: measure1.id } },
    update: {},
    create: {
      questionId: question2.id,
      measureId: measure1.id,
    },
  });

  const measure1Pro = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-3' },
    update: {},
    create: {
      id: 'seed-arg-pro-3',
      content: 'Et demonstrasjonsanlegg kan redusere usikkerhet om kostnader og regulatorisk gjennomføring, og gi beslutningsgrunnlag basert på norske forhold.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      measureId: measure1.id,
      status: 'ACCEPTED',
    },
  });

  const measure1Contra = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-3' },
    update: {},
    create: {
      id: 'seed-arg-contra-3',
      content: 'Et demonstrasjonsanlegg kan binde opp kapital og tid som heller bør brukes på raskere tiltak som energieffektivisering og nettutbygging.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      measureId: measure1.id,
      status: 'ACCEPTED',
    },
  });

  await prisma.measure.update({
    where: { id: measure1.id },
    data: {
      proArgumentCount: 1,
      contraArgumentCount: 1,
    },
  });

  const domainWorldBank = await prisma.domain.upsert({
    where: { hostname: 'worldbank.org' },
    update: {},
    create: {
      hostname: 'worldbank.org',
      name: 'World Bank',
      description: 'Internasjonal utviklingsbank',
      credibilityScore: 0.9,
      credibilityNotes: 'Kilde for politikk- og kostnadsanalyse.',
    },
  });

  const outletWorldBank = await prisma.outlet.upsert({
    where: { id: 'seed-outlet-worldbank' },
    update: {},
    create: {
      id: 'seed-outlet-worldbank',
      name: 'World Bank Reports',
      description: 'Rapporter fra World Bank',
      domainId: domainWorldBank.id,
    },
  });

  const artifactWorldBank = await prisma.artifact.upsert({
    where: { url: 'https://www.worldbank.org/en/programs/pricing-carbon' },
    update: {},
    create: {
      url: 'https://www.worldbank.org/en/programs/pricing-carbon',
      title: 'Carbon Pricing',
      artifactType: 'OFFICIAL_DOCUMENT',
      publishedAt: new Date('2024-01-01'),
      authors: ['World Bank'],
      outletId: outletWorldBank.id,
    },
  });

  const extractWorldBank = await prisma.extract.upsert({
    where: { id: 'seed-extract-4' },
    update: {},
    create: {
      id: 'seed-extract-4',
      artifactId: artifactWorldBank.id,
      content: 'Karbonprising fremheves som et virkemiddel for å redusere utslipp ved å endre økonomiske insentiver.',
      extractType: 'PARAPHRASE',
    },
  });

  const measure2 = await prisma.measure.upsert({
    where: { id: 'seed-measure-2' },
    update: {},
    create: {
      id: 'seed-measure-2',
      title: 'Øke og forutsi CO₂-avgiften',
      description: 'Heve CO₂-avgiften trinnvis med en forutsigbar bane for å stimulere til utslippskutt.',
      rationale: 'Skal gi tydelige prissignaler for investeringer i lavutslipp.',
      status: 'ACCEPTED',
    },
  });

  // Ensure measure2 is linked to the measures question (not the causes question)
  await prisma.questionMeasure.deleteMany({
    where: {
      questionId: question.id,
      measureId: measure2.id,
    },
  });

  await prisma.questionMeasure.upsert({
    where: { questionId_measureId: { questionId: question3.id, measureId: measure2.id } },
    update: {},
    create: {
      questionId: question3.id,
      measureId: measure2.id,
    },
  });

  const measure2Pro = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-4' },
    update: {},
    create: {
      id: 'seed-arg-pro-4',
      content: 'Forutsigbar, gradvis økning i CO₂-avgiften gir aktører tid til å tilpasse seg og gir sterke insentiver til utslippskutt.',
      argumentType: 'PRO',
      strength: 'HIGH',
      measureId: measure2.id,
      status: 'ACCEPTED',
    },
  });

  const measure2Contra = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-4' },
    update: {},
    create: {
      id: 'seed-arg-contra-4',
      content: 'Høyere avgifter kan gi konkurranseulemper og økte levekostnader dersom de ikke kombineres med kompenserende tiltak.',
      argumentType: 'CONTRA',
      strength: 'MEDIUM',
      measureId: measure2.id,
      status: 'ACCEPTED',
    },
  });

  const measure2Pro2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-14' },
    update: {},
    create: {
      id: 'seed-arg-pro-14',
      content: 'Hvis inntektene brukes til målrettet tilbakeføring, kan CO₂-avgift redusere utslipp samtidig som nettoeffekten for sårbare husholdninger dempes.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      measureId: measure2.id,
      status: 'ACCEPTED',
    },
  });

  const measure2Contra2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-contra-15' },
    update: {},
    create: {
      id: 'seed-arg-contra-15',
      content: 'I sektorer med få alternativer på kort sikt kan økte avgifter gi høy kostnad uten tilsvarende utslippskutt, og dermed skape politisk motstand og uforutsigbarhet.',
      argumentType: 'CONTRA',
      strength: 'LOW',
      measureId: measure2.id,
      status: 'ACCEPTED',
    },
  });

  // Add a second PRO argument for nuclear project risk claim
  const riskPro2 = await prisma.argument.upsert({
    where: { id: 'seed-arg-pro-15' },
    update: {},
    create: {
      id: 'seed-arg-pro-15',
      content: 'Sammenstillinger av kraftkostnader viser at kapitalkostnader og byggetid er sentrale drivere for total kostnad i kjernekraft, noe som gjør prosjektene mer eksponert for forsinkelser enn mange andre tiltak.',
      argumentType: 'PRO',
      strength: 'MEDIUM',
      claimId: claim4.id,
      status: 'ACCEPTED',
    },
  });

  await prisma.measure.update({
    where: { id: measure2.id },
    data: {
      proArgumentCount: 2,
      contraArgumentCount: 2,
    },
  });

  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-4' },
    update: {},
    create: {
      id: 'seed-evidence-4',
      extractId: extractWorldBank.id,
      argumentId: measure2Pro.id,
      linkageStrength: 'INDIRECT',
    },
  });

  // Evidence links that require World Bank extract
  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-8' },
    update: {},
    create: {
      id: 'seed-evidence-8',
      extractId: extractWorldBank.id,
      argumentId: pricingPro1.id,
      linkageStrength: 'INDIRECT',
    },
  });

  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-12' },
    update: {},
    create: {
      id: 'seed-evidence-12',
      extractId: extractOecd.id,
      argumentId: riskPro2.id,
      linkageStrength: 'CONSISTENT_WITH',
    },
  });

  await prisma.evidenceLink.upsert({
    where: { id: 'seed-evidence-10' },
    update: {},
    create: {
      id: 'seed-evidence-10',
      extractId: extractWorldBank.id,
      argumentId: measure2Pro2.id,
      linkageStrength: 'CONSISTENT_WITH',
    },
  });

  // Update argument counts (claims) after creating all arguments
  await prisma.claim.update({
    where: { id: claim.id },
    data: {
      proArgumentCount: 3,
      contraArgumentCount: 3,
    },
  });

  await prisma.claim.update({
    where: { id: claim2.id },
    data: {
      proArgumentCount: 3,
      contraArgumentCount: 3,
    },
  });

  await prisma.claim.update({
    where: { id: claim3.id },
    data: {
      proArgumentCount: 2,
      contraArgumentCount: 2,
    },
  });

  await prisma.claim.update({
    where: { id: claim4.id },
    data: {
      proArgumentCount: 2,
      contraArgumentCount: 2,
    },
  });

  await prisma.claim.update({
    where: { id: claim5.id },
    data: {
      proArgumentCount: 2,
      contraArgumentCount: 2,
    },
  });

  // Log events
  await prisma.event.createMany({
    data: [
      { eventType: 'create_topic', entityType: 'Topic', entityId: topic.id, payload: { title: topic.title } },
      { eventType: 'create_topic', entityType: 'Topic', entityId: topic2.id, payload: { title: topic2.title } },
      { eventType: 'create_claim', entityType: 'Claim', entityId: claim.id, payload: { statement: claim.statement } },
      { eventType: 'create_claim', entityType: 'Claim', entityId: claim2.id, payload: { statement: claim2.statement } },
      { eventType: 'create_claim', entityType: 'Claim', entityId: claim3.id, payload: { statement: claim3.statement } },
      { eventType: 'create_claim', entityType: 'Claim', entityId: claim4.id, payload: { statement: claim4.statement } },
      { eventType: 'create_claim', entityType: 'Claim', entityId: claim5.id, payload: { statement: claim5.statement } },
      { eventType: 'add_argument', entityType: 'Argument', entityId: proArg.id, payload: { type: 'PRO' } },
      { eventType: 'add_argument', entityType: 'Argument', entityId: contraArg.id, payload: { type: 'CONTRA' } },
      { eventType: 'add_argument', entityType: 'Argument', entityId: proArg2.id, payload: { type: 'PRO' } },
      { eventType: 'add_argument', entityType: 'Argument', entityId: contraArg2.id, payload: { type: 'CONTRA' } },
      { eventType: 'create_measure', entityType: 'Measure', entityId: measure1.id, payload: { title: measure1.title } },
      { eventType: 'create_measure', entityType: 'Measure', entityId: measure2.id, payload: { title: measure2.title } },
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
  console.log(`  - Topics: ${topic.title}, ${topic2.title}`);
  console.log(`  - Questions: ${question.slug}, ${question2.slug}, ${question3.slug}`);
  console.log(`  - Claims: 5 (with multiple pro/contra arguments)`);
  console.log(`  - Measures: 2 (with balanced pro/contra arguments)`);
  console.log(`  - Sources include IPCC, NOAA, NASA, IEA, OECD/NEA, World Bank`);
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
