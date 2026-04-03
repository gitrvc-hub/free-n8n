import type { UserStatus } from '@prisma/client';

export function getStatusLabel(status: UserStatus): string {
	switch (status) {
		case 'active':
			return 'Live';
		case 'reclaimed':
			return 'Archived';
		case 'suspended':
			return 'Suspended';
	}
}

export function getStatusTone(status: UserStatus): string {
	switch (status) {
		case 'active':
			return 'emerald';
		case 'reclaimed':
			return 'amber';
		case 'suspended':
			return 'rose';
	}
}
