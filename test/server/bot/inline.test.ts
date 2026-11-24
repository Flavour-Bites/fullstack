import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/modules/users/users.service', () => ({
  usersService: {
    findByTelegramId: vi.fn(),
  },
}));

vi.mock('@server/modules/orders/orders.service', () => ({
  ordersService: {
    search: vi.fn(),
    searchForStaff: vi.fn(),
  },
}));

vi.mock('@server/modules/products/products.service', () => ({
  productsService: {
    search: vi.fn(),
  },
}));

import { handleInline } from '@server/bot/inline';
import { usersService } from '@server/modules/users/users.service';
import { ordersService } from '@server/modules/orders/orders.service';
import { productsService } from '@server/modules/products/products.service';

describe('handleInline', () => {
  let inlineHandler: (ctx: any) => Promise<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockBot = {
      on: vi.fn((event, handler) => {
        if (event === 'inline_query') {
          inlineHandler = handler;
        }
      }),
    };
    handleInline(mockBot as any);
  });

  it('answers with empty results when query is empty', async () => {
    const ctx = {
      inlineQuery: { query: '   ' },
      from: { id: 123 },
      answerInlineQuery: vi.fn(),
    };

    await inlineHandler(ctx);

    expect(ctx.answerInlineQuery).toHaveBeenCalledWith([]);
    expect(ordersService.searchForStaff).not.toHaveBeenCalled();
    expect(productsService.search).not.toHaveBeenCalled();
  });

  it('returns only gallery items and hides orders for non-staff user', async () => {
    vi.mocked(usersService.findByTelegramId).mockResolvedValue({
      id: 'usr_customer',
      role: 'customer',
      name: 'John Customer',
    } as any);

    vi.mocked(productsService.search).mockResolvedValue([
      {
        id: 'gal_1',
        name: 'Strawberry Dream',
        description: 'Fresh strawberries with cream',
        flavors: ['Strawberry', 'Vanilla'],
        servingCount: 15,
        priceEstimate: '1,500 ETB',
        image: 'https://example.com/cake.jpg',
      } as any,
    ]);

    const ctx = {
      inlineQuery: { query: 'strawberry' },
      from: { id: 123 },
      answerInlineQuery: vi.fn(),
    };

    await inlineHandler(ctx);

    expect(ordersService.searchForStaff).not.toHaveBeenCalled();
    expect(ctx.answerInlineQuery).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: 'gallery_gal_1',
          title: 'Strawberry Dream',
        }),
      ],
      expect.objectContaining({ is_personal: true })
    );
  });

  it('returns both orders and gallery items with escaped HTML for staff user', async () => {
    vi.mocked(usersService.findByTelegramId).mockResolvedValue({
      id: 'usr_staff',
      role: 'staff',
      name: 'Yodit Baker',
    } as any);

    vi.mocked(ordersService.searchForStaff).mockResolvedValue([
      {
        id: 'FB-999',
        status: 'Designing',
        contactName: 'Alice <script>alert(1)</script>',
        contactPhone: '+251911223344',
        eventType: 'Wedding & Reception',
        flavor: 'Chocolate Ganache',
        eventDate: '2026-08-15',
        guestCount: 50,
        tierCount: 3,
        price: 4500,
      } as any,
    ]);

    vi.mocked(productsService.search).mockResolvedValue([
      {
        id: 'gal_2',
        name: 'Chocolate Bloom',
        description: 'Decadent chocolate',
        flavors: ['Chocolate'],
        servingCount: 20,
        priceEstimate: '2,000 ETB',
      } as any,
    ]);

    const ctx = {
      inlineQuery: { query: 'chocolate' },
      from: { id: 999 },
      answerInlineQuery: vi.fn(),
    };

    await inlineHandler(ctx);

    expect(ordersService.searchForStaff).toHaveBeenCalledWith('chocolate', { id: 'usr_staff', role: 'staff' }, 30);
    expect(ctx.answerInlineQuery).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'order_FB-999',
          title: expect.stringContaining('&lt;script&gt;'),
          input_message_content: expect.objectContaining({
            message_text: expect.stringContaining('&lt;script&gt;alert(1)&lt;/script&gt;'),
            parse_mode: 'HTML',
          }),
        }),
        expect.objectContaining({
          id: 'gallery_gal_2',
          title: 'Chocolate Bloom',
        }),
      ]),
      expect.objectContaining({ is_personal: true })
    );
  });
});

