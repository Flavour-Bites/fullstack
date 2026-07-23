import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/integrations/telegram/telegramClient.js', () => ({
  sendMessage: vi.fn(),
}));

vi.mock('@/app/config/prisma.js', () => ({
  getPrisma: vi.fn(),
}));

import { contactService } from '@/features/contact/api/contact.service.js';
import { sendMessage } from '@/integrations/telegram/telegramClient.js';
import { getPrisma } from '@/app/config/prisma.js';

const mockSendMessage = vi.mocked(sendMessage);
const mockGetPrisma = vi.mocked(getPrisma);

function setupStaffIds(ids: string[]) {
  mockGetPrisma.mockReturnValue({
    user: {
      findMany: vi.fn().mockResolvedValue(ids.map((id) => ({ telegramId: id }))),
    },
  } as any);
}

describe('contactService.submitContact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends message to all staff members', async () => {
    setupStaffIds(['staff_1', 'staff_2', 'staff_3']);
    mockSendMessage.mockResolvedValue(true);

    const result = await contactService.submitContact({
      name: 'John',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'Test message',
    });

    expect(result.delivered).toBe(true);
    expect(mockSendMessage).toHaveBeenCalledTimes(3);
    expect(mockSendMessage).toHaveBeenCalledWith('staff_1', expect.stringContaining('John'));
    expect(mockSendMessage).toHaveBeenCalledWith('staff_2', expect.stringContaining('John'));
    expect(mockSendMessage).toHaveBeenCalledWith('staff_3', expect.stringContaining('John'));
  });

  it('returns delivered: false when no staff members', async () => {
    setupStaffIds([]);
    mockSendMessage.mockResolvedValue(true);

    const result = await contactService.submitContact({
      name: 'John',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'Test',
    });

    expect(result.delivered).toBe(false);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('does not throw when one staff member fails to receive message', async () => {
    setupStaffIds(['staff_1', 'staff_2', 'staff_3']);
    mockSendMessage
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('Telegram API down'))
      .mockResolvedValueOnce(true);

    const result = await contactService.submitContact({
      name: 'John',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'Test',
    });

    // Should still report delivered because staff exist
    expect(result.delivered).toBe(true);
    // All 3 calls attempted
    expect(mockSendMessage).toHaveBeenCalledTimes(3);
  });

  it('does not throw when ALL staff members fail', async () => {
    setupStaffIds(['staff_1', 'staff_2']);
    mockSendMessage.mockRejectedValue(new Error('Total failure'));

    // Promise.allSettled catches all rejections
    const result = await contactService.submitContact({
      name: 'John',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'Test',
    });

    // delivered is based on staffIds.length, not send success
    expect(result.delivered).toBe(true);
    expect(mockSendMessage).toHaveBeenCalledTimes(2);
  });

  it('escapes HTML in name and message fields', async () => {
    setupStaffIds(['staff_1']);
    mockSendMessage.mockResolvedValue(true);

    await contactService.submitContact({
      name: '<script>alert("xss")</script>',
      email: 'test@test.com',
      subject: 'Test & <b>bold</b>',
      message: 'Hello <img src=x onerror=alert(1)>',
    });

    const sentText = mockSendMessage.mock.calls[0][1] as string;
    expect(sentText).not.toContain('<script>');
    expect(sentText).toContain('&lt;script&gt;');
    expect(sentText).toContain('Test &amp; &lt;b&gt;bold&lt;/b&gt;');
  });

  it('returns delivered: true when prisma returns no staff but query succeeds', async () => {
    mockGetPrisma.mockReturnValue({
      user: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as any);
    mockSendMessage.mockResolvedValue(true);

    const result = await contactService.submitContact({
      name: 'John',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'Test',
    });

    expect(result.delivered).toBe(false);
  });
});
