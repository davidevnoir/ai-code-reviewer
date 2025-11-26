import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { inject } from '@angular/core';
import { PrInputComponent } from './components/pr-input/pr-input';
import { AnalysisResultsComponent } from './components/analysis-results/analysis-results';
import { DownloadSectionComponent } from './components/download-section/download-section';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog';
import { AnalysisResult } from './models';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    PrInputComponent,
    AnalysisResultsComponent,
    DownloadSectionComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly dialog = inject(MatDialog);

  // Application state
  protected readonly title = signal('PR Analysis Tool');
  protected readonly analysisResult = signal<AnalysisResult | null>(null);

  /**
   * Handle analysis complete event from PrInputComponent
   */
  onAnalysisComplete(result: AnalysisResult): void {
    this.analysisResult.set(result);
  }

  /**
   * Open settings dialog
   */
  openSettings(): void {
    this.dialog.open(SettingsDialogComponent, {
      width: '600px',
      disableClose: false,
    });
  }
}
