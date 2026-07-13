export type InvitationLinkKind = 'company' | 'user';

const INVITATION_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITATION_CODE_LENGTH = 16;

export const makeShortInvitationCode = () => {
  const bytes = new Uint8Array(INVITATION_CODE_LENGTH);

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, byte => INVITATION_CODE_ALPHABET[byte % INVITATION_CODE_ALPHABET.length]).join('');
};

export const invitationPath = (kind: InvitationLinkKind, code: string) => {
  const prefix = kind === 'company' ? 'e' : 'i';
  return `/plataforma/${prefix}/${encodeURIComponent(code)}`;
};

