package br.com.datalogo.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /** Ao sair de foco, empurra para o widget os valores que o app acabou de publicar. */
    @Override
    public void onPause() {
        super.onPause();
        DatalogoWidget.atualizarTodos(this);
    }
}
