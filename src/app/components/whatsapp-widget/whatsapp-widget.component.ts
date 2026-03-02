import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-whatsapp-widget',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './whatsapp-widget.component.html',
    styleUrls: ['./whatsapp-widget.component.css'],
    animations: [
        trigger('tooltipFade', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
            ])
        ]),
        trigger('popupFade', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.9) translateY(20px)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9) translateY(20px)' }))
            ])
        ])
    ]
})
export class AppWhatsappWidgetComponent implements OnInit {
    isOpen = false;
    showTooltip = false;

    // Customization
    phoneNumber = '+261342725686'; // Replace with the actual WhatsApp number
    contactName = 'Stefan';
    contactRole = 'CEO of Stefan Mall';
    welcomeMessage = 'Hello, Let\'s talk about your shop project';

    ngOnInit() {
        // Show tooltip after a short delay on load
        setTimeout(() => {
            this.showTooltip = true;
            // Auto-hide tooltip after some time if not clicked
            setTimeout(() => {
                if (!this.isOpen) {
                    this.showTooltip = false;
                }
            }, 10000);
        }, 2000);
    }

    togglePopup(event: Event) {
        event.stopPropagation();
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.showTooltip = false;
        }
    }

    openWhatsApp(event: Event) {
        event.stopPropagation();
        const url = `https://wa.me/${this.phoneNumber.replace('+', '')}?text=${encodeURIComponent(this.welcomeMessage)}`;
        window.open(url, '_blank');
        this.isOpen = false;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        // Close popup if clicked outside
        if (this.isOpen) {
            this.isOpen = false;
        }
    }
}
