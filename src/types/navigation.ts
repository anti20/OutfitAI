export type OutfitAnalysisResult = {
  verdict: 'yes' | 'mostly' | 'no';
  outfitType:
    | 'casual'
    | 'smart-casual'
    | 'business'
    | 'formal'
    | 'sporty'
    | 'streetwear'
    | 'mixed'
    | 'unknown';
  recommendedFor: string[];
  colorMatching: 'good' | 'okay' | 'poor';
  styleConsistency: 'good' | 'okay' | 'poor';
  explanation: string;
  suggestions: string[];
};

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  PhotoPreview: {
    imageUri: string;
    fileName?: string;
    type?: string;
  };
  Result: {
    analysis: OutfitAnalysisResult;
  };
};
