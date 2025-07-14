import axios from 'axios';

export class KeycloakAdminService {
  private baseUrl = process.env.KEYCLOAK_URL!;
  private realm = process.env.KEYCLOAK_REALM!;
  private clientId = process.env.KEYCLOAK_CLIENT_ID!;
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET!;
  private token = '';

  constructor() {}

  private async authenticate(): Promise<void> {
    const response = await axios.post(
      `${this.baseUrl}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'admin',
        password: 'KcAdmin'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    this.token = response.data.access_token;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.token) {
      await this.authenticate();
    }
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getGroupIdByName(groupName: string): Promise<string | null> {
    const headers = await this.getAuthHeaders();
    const response = await axios.get(`${this.baseUrl}/admin/realms/${this.realm}/groups`, {
      headers,
    });

    const group = response.data.find((g: any) => g.name === groupName);
    return group?.id || null;
  }

  async createSubgroup(parentGroupId: string, subgroupName: string): Promise<string | null> {
    const headers = await this.getAuthHeaders();
    console.log("parentGroupId---->",parentGroupId)
    // Create subgroup
   const subgroup =  await axios.post(
      `${this.baseUrl}/admin/realms/${this.realm}/groups/${parentGroupId}/children`,
      { name: subgroupName },
      { headers }
    );
    console.log("subgroupid--->",subgroup)
    // Fetch updated children to get the ID
    const response = await axios.get(
      `${this.baseUrl}/admin/realms/${this.realm}/groups/${parentGroupId}/children`,
      { headers }
    );
    console.log("response123--->",response)
    const subGroup = response.data.find((sg: any) => sg.name === subgroupName);
    return subGroup?.id || null;
  }

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    await axios.put(
      `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/groups/${groupId}`,
      {},
      { headers }
    );
  }
}
