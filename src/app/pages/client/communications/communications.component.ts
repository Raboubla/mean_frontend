import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommunicationService, Communication } from '../../../services/communication-services/communication-services.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-client-communications',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatCardModule,
    ],
    templateUrl: './communications.component.html',
})
export class ClientCommunicationsComponent implements OnInit {
    all: Communication[] = [];
    events: Communication[] = [];
    announcements: Communication[] = [];
    isLoading = true;
    activeTab: 'ALL' | 'EVENT' | 'ANNOUNCEMENT' = 'ALL';

    constructor(private communicationService: CommunicationService) { }

    ngOnInit(): void {
        this.communicationService.getUpcomingCommunications().subscribe({
            next: (response: any) => { // On utilise 'any' ici pour autoriser l'accès à .communications
                const data = response.communications;

                this.all = data;

                // On type explicitement le paramètre 'c' pour corriger l'erreur TS7006
                this.events = data.filter((c: any) => c.type === 'EVENT');
                this.announcements = data.filter((c: any) => c.type === 'ANNOUNCEMENT');

                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching communications', err);
                this.isLoading = false;
            }
        });
    }

    get displayed(): Communication[] {
        if (this.activeTab === 'EVENT') return this.events;
        if (this.activeTab === 'ANNOUNCEMENT') return this.announcements;
        return this.all;
    }

    setTab(tab: 'ALL' | 'EVENT' | 'ANNOUNCEMENT'): void {
        this.activeTab = tab;
    }

    getImageUrl(comm: Communication): string {
        if (!comm.image_url) return 'assets/images/products/s1.jpg';
        if (comm.image_url.startsWith('http')) return comm.image_url;
        const baseUrl = environment.apiUrl.replace('/api', '');
        return `${baseUrl}${comm.image_url}`;
    }

    getDaysLeft(endDate: Date): number {
        const now = new Date();
        const end = new Date(endDate);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('fr-DZ', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }
}
