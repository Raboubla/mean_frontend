import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService, Communication } from '../../../services/communication-services/communication-services.service';
import { AppCommunicationDialogComponent } from '../communication-dialog/communication-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-communications',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule
    ],
    templateUrl: './communication-list.component.html',
})
export class AppCommunicationComponent implements OnInit {
    displayedColumns: string[] = ['title', 'type', 'target', 'dates', 'shop', 'actions'];
    dataSource: MatTableDataSource<Communication>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private communicationService: CommunicationService) {
        this.dataSource = new MatTableDataSource<Communication>();
    }

    ngOnInit(): void {
        this.loadCommunications();
    }

    loadCommunications() {
        this.communicationService.getAllCommunications().subscribe({
            next: (res: any) => {
                const comms = Array.isArray(res) ? res : (res.communications || []);
                this.dataSource.data = comms;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Error fetching communications', err)
        });
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppCommunicationDialogComponent, {
            data: obj,
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') {
                this.loadCommunications();
            }
        });
    }

    deleteCommunication(obj: any) {
        if (confirm('Are you sure you want to delete ' + obj.title + '?')) {
            this.communicationService.deleteCommunication(obj._id).subscribe({
                next: () => this.loadCommunications(),
                error: (err) => console.error('Error deleting communication', err)
            });
        }
    }
}
