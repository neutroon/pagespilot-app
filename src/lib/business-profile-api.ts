import { fetchWithAuth } from "@/services/auth-api";
import {
  BUSINESS_PROFILE_API,
  //  RAG_API
} from "./config";

export interface BusinessProfile {
  id: number;
  name: string;
  identity: string;
  targetAudience: string;
  voiceAndTone: string;
  productsServices: string[];
  expectedUserIntents: string[];
  corePolicies: string;
  phoneNumbers: string[];
  workingHours: string;
  address: string;
  faqs: { question: string; answer: string }[];
  facebookPages: {
    pageId: string;
  }[];
}

export type BusinessProfilePayload = Omit<
  BusinessProfile,
  "id" | "facebookPages"
>;

export interface BusinessProfilesResponse {
  message: string;
  businessProfiles: BusinessProfile[];
}

class BusinessProfileService {
  async get(): Promise<BusinessProfile | null> {
    try {
      const response = (await fetchWithAuth(
        BUSINESS_PROFILE_API.BASE,
      )) as BusinessProfilesResponse;
      if (
        response &&
        response.businessProfiles &&
        response.businessProfiles.length > 0
      ) {
        return response.businessProfiles[0];
      }
      return null;
    } catch {
      // If none exists, return null
      return null;
    }
  }

  async getAll(): Promise<BusinessProfile[]> {
    try {
      const response = (await fetchWithAuth(
        BUSINESS_PROFILE_API.BASE,
      )) as BusinessProfilesResponse;
      return response?.businessProfiles || [];
    } catch {
      return [];
    }
  }

  async save(data: BusinessProfilePayload): Promise<BusinessProfile> {
    const res = await fetchWithAuth(BUSINESS_PROFILE_API.BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Handle both direct profile return and { businessProfile: {...} } wrapped return
    return res.businessProfile || res;
  }
}

export const businessProfileService = new BusinessProfileService();

/**
 * Fire-and-forget: hits the RAG ingest endpoint and swallows errors.
 * Used after saving a business profile to update the knowledge base asynchronously.
 */
// export function fireRagIngest(businessId: number): void {
//   fetch(RAG_API.INGEST(businessId), {
//     method: "POST",
//     // Make sure we include cookies if this uses Next.js app router API handlers
//     // or if the backend requires the session cookie
//     credentials: "include",
//   }).catch(() => {
//     // silently swallowed
//   });
// }
