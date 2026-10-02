package br.com.datalogo.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Widget de tela inicial: mostra os indicadores fixados pelo usuário com o último valor.
 * Os dados vêm do app web via Capacitor Preferences (SharedPreferences "CapacitorStorage",
 * chave "datalogo-widget") — o widget não faz requisição de rede.
 */
public class DatalogoWidget extends AppWidgetProvider {

    private static final String PREFS = "CapacitorStorage";
    private static final String CHAVE = "datalogo-widget";
    public static final String ACAO_ATUALIZAR = "br.com.datalogo.app.ATUALIZAR_WIDGET";

    private static final int[] IDS_NOME = { R.id.item_nome_1, R.id.item_nome_2, R.id.item_nome_3, R.id.item_nome_4 };
    private static final int[] IDS_VALOR = { R.id.item_valor_1, R.id.item_valor_2, R.id.item_valor_3, R.id.item_valor_4 };
    private static final int[] IDS_LINHA = { R.id.item_linha_1, R.id.item_linha_2, R.id.item_linha_3, R.id.item_linha_4 };

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] idsWidget) {
        for (int idWidget : idsWidget) {
            manager.updateAppWidget(idWidget, montarViews(context));
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACAO_ATUALIZAR.equals(intent.getAction())) {
            atualizarTodos(context);
        }
    }

    /** Força a atualização de todas as instâncias do widget (chamado quando o app sai de foco). */
    public static void atualizarTodos(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName componente = new ComponentName(context, DatalogoWidget.class);
        int[] ids = manager.getAppWidgetIds(componente);
        for (int id : ids) {
            manager.updateAppWidget(id, montarViews(context));
        }
    }

    private static RemoteViews montarViews(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_datalogo);

        // Toque no widget abre o app.
        Intent abrir = new Intent(context, MainActivity.class);
        views.setOnClickPendingIntent(
            R.id.widget_raiz,
            PendingIntent.getActivity(context, 0, abrir, PendingIntent.FLAG_IMMUTABLE)
        );

        int quantidade = 0;
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String bruto = prefs.getString(CHAVE, null);
            if (bruto != null) {
                JSONArray itens = new JSONObject(bruto).getJSONArray("itens");
                quantidade = Math.min(itens.length(), IDS_NOME.length);
                for (int i = 0; i < quantidade; i++) {
                    JSONObject item = itens.getJSONObject(i);
                    views.setTextViewText(IDS_NOME[i], item.optString("nome"));
                    views.setTextViewText(IDS_VALOR[i], item.optString("valor"));
                }
            }
        } catch (Exception e) {
            quantidade = 0; // dado ausente ou corrompido: cai no estado vazio
        }

        for (int i = 0; i < IDS_LINHA.length; i++) {
            views.setViewVisibility(IDS_LINHA[i], i < quantidade ? View.VISIBLE : View.GONE);
        }
        views.setViewVisibility(R.id.widget_vazio, quantidade == 0 ? View.VISIBLE : View.GONE);

        return views;
    }
}
