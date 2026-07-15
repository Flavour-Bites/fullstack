// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import AdminUsers from './AdminUsers';

const noop = () => Promise.resolve(true);

const sampleUsers = [
  { id: 'u1', name: 'Alice', email: 'alice@test.com', role: 'admin', telegramId: '1', createdAt: '2024-01-01' },
  { id: 'u2', name: 'Bob', email: 'bob@test.com', role: 'customer', telegramId: '2', createdAt: '2024-02-01' },
  { id: 'u3', name: 'Charlie', email: '', role: 'staff', telegramId: '3', createdAt: '2024-03-01' },
];

const currentUser = { id: 'u1', telegramId: '1', name: 'Alice', role: 'admin' } as any;

describe('AdminUsers', () => {
  it('shows access denied for non-admin', () => {
    render(
      <AdminUsers
        users={[]}
        usersLoading={false}
        isAdmin={false}
        currentUser={null}
        saveUserRole={noop}
        deleteUser={noop}
        fetchUsers={noop}
      />
    );
    expect(screen.getByText('Admin Access Only')).toBeInTheDocument();
  });

  it('shows loading skeleton for admin', () => {
    const { container } = render(
      <AdminUsers
        users={[]}
        usersLoading={true}
        isAdmin={true}
        currentUser={currentUser}
        saveUserRole={noop}
        deleteUser={noop}
        fetchUsers={noop}
      />
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders user rows', () => {
    render(
      <AdminUsers
        users={sampleUsers}
        usersLoading={false}
        isAdmin={true}
        currentUser={currentUser}
        saveUserRole={noop}
        deleteUser={noop}
        fetchUsers={noop}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });
});
