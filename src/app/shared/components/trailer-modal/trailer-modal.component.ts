import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-trailer-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
        @if (isOpen) {
            <div class="modal-overlay" (click)="close()">
                <div class="modal-box" (click)="$event.stopPropagation()">
                    <button class="modal-close" (click)="close()">✕</button>
                    <div class="modal-body">
                        @if (getEmbedUrl()) {
                            <iframe 
                                class="trailer-player" 
                                [src]="getEmbedUrl()" 
                                frameborder="0" 
                                allowfullscreen>
                            </iframe>
                        } @else {
                            <div class="placeholder">
                                <p>🎬 No Trailer Available</p>
                                <p style="font-size: 12px; color: #999;">{{ trailerUrl || 'No URL provided' }}</p>
                            </div>
                        }
                    </div>
                </div>
            </div>
        }
    `,
    styles: [`
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal-box {
            position: relative;
            background: #222;
            border-radius: 8px;
            width: 95%;
            max-width: 1200px;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.9);
        }

        .modal-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: red;
            color: white;
            border: none;
            padding: 8px 12px;
            font-size: 20px;
            cursor: pointer;
            z-index: 1001;
            border-radius: 4px;
        }

        .modal-close:hover {
            background: darkred;
        }

        .modal-body {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .trailer-player {
            width: 100%;
            height: 100%;
            border: none;
        }

        .placeholder {
            background: #333;
            border: 2px solid #555;
            border-radius: 6px;
            padding: 60px 20px;
            width: 80%;
            max-width: 600px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #aaa;
        }

        .placeholder p {
            margin: 10px 0;
        }
    `]
})
export class TrailerModalComponent {
    private sanitizer = inject(DomSanitizer);

    @Input() isOpen = false;
    @Input() trailerUrl: string | null = null;
    @Output() closeModal = new EventEmitter<void>();

    getEmbedUrl(): SafeResourceUrl | null {
        if (!this.trailerUrl) return null;
        const embedUrl = this.convertToEmbedUrl(this.trailerUrl);
        return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }

    private convertToEmbedUrl(url: string): string {
        // Already in embed format
        if (url.includes('/embed/')) {
            return url;
        }

        // https://www.youtube.com/watch?v=dQw4w9WgXcQ
        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (watchMatch) {
            return `https://www.youtube.com/embed/${watchMatch[1]}`;
        }

        // Return as-is if no match
        return url;
    }

    close(): void {
        this.closeModal.emit();
    }
}
