import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Mensaje } from '../interfaces/mensaje.interface';

import { map } from 'rxjs/operators';

import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

import * as firebase from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;
  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor(private afs: AngularFirestore,
              public fireAuth: AngularFireAuth) {

                this.fireAuth.authState.subscribe( user => {
                  console.log('Estado del usuario', user);

                  if (!user) {
                    return;
                  }

                  this.usuario.nombre = user.displayName;
                  this.usuario.uid = user.uid;
                  this.usuario.photo = user.photoURL;

                });

  }

  cargarMensajes() {
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha', 'desc').limit(1000));

    return this.itemsCollection.valueChanges()
    // poner el pipe
        .pipe(
          map( (mensajes: Mensaje[]) => {
          console.log(mensajes);

          this.chats = [];

          for (const mensaje of mensajes) {
            this.chats.unshift(mensaje);
          }

          return this.chats;

          // this.chats = mensajes;
        })
      );

  }

  agregarMensaje(texto: string) {

      const mensaje: Mensaje = {
          nombre: this.usuario.nombre,
          mensaje: texto,
          fecha: new Date().getTime(),
          uid: this.usuario.uid,
          photo: this.usuario.photo
      };

      return this.itemsCollection.add(mensaje);
  }


  login(proveedor: string) {

    if(proveedor === 'google') {
      firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } else {
      firebase.auth().signInWithPopup(new firebase.auth.TwitterAuthProvider());
    }

  }


  logout() {
    this.usuario = {};
    firebase.auth().signOut();
  }

}
