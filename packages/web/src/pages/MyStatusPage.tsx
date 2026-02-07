import { useQuery } from '@apollo/client';
import { MY_STATUS, MY_VALIDATIONS, PUBLISHING_RULES } from '../lib/queries';

interface MyStatusData {
  myStatus: {
    validationCredits: number;
    qualityScore: number;
    totalValidations: number;
    confirmedCount: number;
    challengedCount: number;
    nuancedCount: number;
    publishedClaims: number;
    publishedArguments: number;
  };
}

interface Validation {
  id: string;
  validationType: 'CONFIRMED' | 'CHALLENGED' | 'NUANCED';
  comment: string | null;
  createdAt: string;
  claim?: {
    id: string;
    statement: string;
  };
  argument?: {
    id: string;
    content: string;
    argumentType: 'PRO' | 'CONTRA';
  };
  evidenceLink?: {
    id: string;
  };
}

interface MyValidationsData {
  myValidations: Validation[];
}

interface PublishingRule {
  id: string;
  ruleKey: string;
  ruleValue: string;
  description: string | null;
  createdAt: string;
}

interface PublishingRulesData {
  publishingRules: PublishingRule[];
}

const getValidationBadgeColor = (type: 'CONFIRMED' | 'CHALLENGED' | 'NUANCED') => {
  switch (type) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'CHALLENGED':
      return 'bg-red-100 text-red-800';
    case 'NUANCED':
      return 'bg-yellow-100 text-yellow-800';
  }
};

export function MyStatusPage() {
  const { data: statusData, loading: statusLoading } = useQuery<MyStatusData>(MY_STATUS);
  const { data: validationsData, loading: validationsLoading } = useQuery<MyValidationsData>(MY_VALIDATIONS);
  const { data: rulesData, loading: rulesLoading } = useQuery<PublishingRulesData>(PUBLISHING_RULES);

  if (statusLoading || validationsLoading || rulesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Laster...</div>
      </div>
    );
  }

  const status = statusData?.myStatus;
  const validations = validationsData?.myValidations || [];
  const rules = rulesData?.publishingRules || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Min status</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Valideringskreditter</div>
          <div className="text-3xl font-bold text-blue-600">{status?.validationCredits}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Kvalitetspoeng</div>
          <div className="text-3xl font-bold text-green-600">{status?.qualityScore.toFixed(1)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Totale valideringer</div>
          <div className="text-3xl font-bold text-purple-600">{status?.totalValidations}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Publiserte bidrag</div>
          <div className="text-3xl font-bold text-orange-600">
            {(status?.publishedClaims || 0) + (status?.publishedArguments || 0)}
          </div>
        </div>
      </div>

      {/* Validation Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Valideringsfordeling</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Bekreftet</div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">{status?.confirmedCount}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({status?.totalValidations ? Math.round((status.confirmedCount / status.totalValidations) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Utfordret</div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-600">{status?.challengedCount}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({status?.totalValidations ? Math.round((status.challengedCount / status.totalValidations) * 100) : 0}%)
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Nyansert</div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-yellow-600">{status?.nuancedCount}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({status?.totalValidations ? Math.round((status.nuancedCount / status.totalValidations) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Publishing Rules */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Publiseringsregler</h2>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <div className="font-medium">{rule.ruleKey}</div>
                {rule.description && <div className="text-sm text-gray-600">{rule.description}</div>}
              </div>
              <div className="text-lg font-bold text-blue-600">{rule.ruleValue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Valideringshistorikk</h2>
        {validations.length === 0 ? (
          <p className="text-gray-600">Du har ikke validert noe innhold ennå.</p>
        ) : (
          <div className="space-y-4">
            {validations.map((validation) => (
              <div key={validation.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getValidationBadgeColor(validation.validationType)}`}>
                    {validation.validationType}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(validation.createdAt).toLocaleDateString('nb-NO')}
                  </span>
                </div>
                {validation.claim && (
                  <div className="text-sm mb-1">
                    <span className="font-medium">Påstand:</span> {validation.claim.statement}
                  </div>
                )}
                {validation.argument && (
                  <div className="text-sm mb-1">
                    <span className="font-medium">Argument ({validation.argument.argumentType}):</span>{' '}
                    {validation.argument.content}
                  </div>
                )}
                {validation.evidenceLink && (
                  <div className="text-sm mb-1">
                    <span className="font-medium">Kilde:</span> Kildekobling #{validation.evidenceLink.id}
                  </div>
                )}
                {validation.comment && (
                  <div className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Begrunnelse:</span> {validation.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
