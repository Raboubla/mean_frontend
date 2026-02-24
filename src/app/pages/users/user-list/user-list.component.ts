import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../services/user-services/user.service';
import { AppUserDialogComponent } from '../user-dialog/user-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
    ],
    templateUrl: './user-list.component.html',
})
export class AppUserComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['email', 'role', 'shop', 'status', 'actions'];
    dataSource: MatTableDataSource<User>;
    isLoading = false;

    // Filter state
    searchQuery = '';
    selectedStatus = '';
    selectedRole = '';

    readonly statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'BANNED', label: 'Banned' },
    ];

    readonly roleOptions = [
        { value: '', label: 'All Roles' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'BUYERS', label: 'Buyer' },
        { value: 'ADMINSHOP', label: 'Shop Admin' },
    ];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(public dialog: MatDialog, private userService: UserService) {
        this.dataSource = new MatTableDataSource<User>();
    }

    ngOnInit(): void {
        // Debounce the text search; dropdowns trigger immediately
        this.searchSubject.pipe(
            debounceTime(350),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => this.fetchUsers());

        this.fetchUsers();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchInput(value: string): void {
        this.searchQuery = value;
        this.searchSubject.next(value);
    }

    onDropdownChange(): void {
        this.fetchUsers();
    }

    fetchUsers(): void {
        this.isLoading = true;
        this.userService.searchUsers(
            this.searchQuery || undefined,
            this.selectedStatus || undefined,
            this.selectedRole || undefined
        ).subscribe({
            next: (res) => {
                this.dataSource.data = res.users;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching users', err);
                this.isLoading = false;
            }
        });
    }

    // ── Dialog helpers (unchanged) ──────────────────────────
    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppUserDialogComponent, { data: obj });
        dialogRef.afterClosed().subscribe((result) => {
            if (result?.event === 'Add' || result?.event === 'Update') {
                this.fetchUsers();
            }
        });
    }

    deleteUser(obj: any): void {
        if (confirm('Are you sure you want to delete ' + obj.email + '?')) {
            this.userService.deleteUser(obj._id).subscribe({
                next: () => this.fetchUsers(),
                error: (err) => console.error('Error deleting user', err)
            });
        }
    }

    toggleStatus(obj: any): void {
        this.userService.toggleStatus(obj._id).subscribe({
            next: () => this.fetchUsers(),
            error: (err) => {
                console.error('Erreur lors du changement de statut', err);
                alert('Impossible de changer le statut de l\'utilisateur');
            }
        });
    }
}
