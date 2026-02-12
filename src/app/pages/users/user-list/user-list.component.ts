import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { UserService, User } from '../../../services/user-services/user.service';
import { AppUserDialogComponent } from '../user-dialog/user-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-users',
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
    ],
    templateUrl: './user-list.component.html',
})
export class AppUserComponent implements OnInit {
    displayedColumns: string[] = ['email', 'role', 'shop', 'status', 'actions'];
    dataSource: MatTableDataSource<User>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private userService: UserService) {
        this.dataSource = new MatTableDataSource<User>();
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe({
            next: (res: any) => {
                this.dataSource.data = res.users;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Error fetching users', err)
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
        const dialogRef = this.dialog.open(AppUserDialogComponent, {
            data: obj,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result.event === 'Add') {
                this.addRowData(result.data);
            } else if (result.event === 'Update') {
                this.updateRowData(result.data);
            }
        });
    }

    addRowData(row_obj: any) {
        // In a real app, the service call in the dialog would handle the update,
        // and we might just reload the list or push to array if optimized.
        // Since our dialog service call is mocked effectively by calling the service inside the dialog,
        // we can just reload or push. Let's reload to be safe and simple.
        this.loadUsers();
    }

    updateRowData(row_obj: any) {
        this.loadUsers();
    }

    deleteUser(obj: any) {
        if (confirm('Are you sure you want to delete ' + obj.username + '?')) {
            this.userService.deleteUser(obj._id).subscribe({
                next: () => this.loadUsers(),
                error: (err) => console.error('Error deleting user', err)
            });
        }
    }

    toggleStatus(obj: any) {
        // On appelle le service avec l'ID de l'utilisateur
        this.userService.toggleStatus(obj._id).subscribe({
            next: (response: any) => {
                console.log('Statut mis à jour avec succès');

                // Option 1 : Rechargement complet (plus sûr pour la synchro)
                this.loadUsers();

                // Option 2 (Optimiste) : Si tu ne veux pas recharger toute la liste, 
                // tu peux mettre à jour l'objet localement avec la réponse du serveur
                // obj.status = response.user.status; 
            },
            error: (err) => {
                console.error('Erreur lors du changement de statut', err);
                alert('Impossible de changer le statut de l\'utilisateur');
            }
        });
    }
}
