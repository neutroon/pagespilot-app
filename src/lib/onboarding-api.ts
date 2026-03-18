import { fetchWithAuth } from "@/services/auth-api";
import { ONBOARDING_API } from "./config";

export interface OnboardingResponse {
  success: boolean;
  data: {
    business_name: string;
    brand_identity: string;
    target_audience: string;
    voice_and_tone: string;
    products_services: string[];
    expected_user_intents: string[];
    contact_and_hours: {
      phone_numbers: string[];
      working_hours: string;
      address: string;
    };
    core_policies: string;
    faqs: {
      question: string;
      answer: string;
    }[];
  };
}

class OnboardingService {
  async analyzeWebsite(url: string): Promise<OnboardingResponse> {
    return fetchWithAuth(ONBOARDING_API.ANALYZE_WEBSITE, {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  //   async submitOnboardingAnswers(answers: any): Promise<OnboardingResponse> {
  //     return fetchWithAuth(ONBOARDING_API.SUBMIT_ANSWERS, {
  //       method: "POST",
  //       body: JSON.stringify(answers),
  //     });
  //   }
}

export const onboardingService = new OnboardingService();
