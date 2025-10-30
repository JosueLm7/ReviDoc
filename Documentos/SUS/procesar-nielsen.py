import pandas as pd
import os
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib import rcParams

# Configurar estilo de gráficos
plt.style.use('default')
rcParams['font.size'] = 10
sns.set_palette("husl")

def generar_graficos_usabilidad(df, df_heuristicas, promedio_global):
    """
    Genera gráficos profesionales para el análisis de usabilidad
    """
    
    # Crear carpeta para gráficos si no existe
    if not os.path.exists("graficos"):
        os.makedirs("graficos")
    
    # 1. GRÁFICO DE BARRAS - PROMEDIO POR HEURÍSTICA
    plt.figure(figsize=(12, 8))
    bars = plt.barh(df_heuristicas['Heurística'], df_heuristicas['Promedio'], 
                    color=['#2E8B57' if x >= 4.3 else '#FFA500' if x >= 3.7 else '#FF6B6B' for x in df_heuristicas['Promedio']])
    
    # Añadir valores en las barras
    for bar, valor in zip(bars, df_heuristicas['Promedio']):
        plt.text(bar.get_width() + 0.05, bar.get_y() + bar.get_height()/2, 
                f'{valor:.2f}', ha='left', va='center', fontweight='bold')
    
    plt.xlabel('Puntuación Promedio (1-5)')
    plt.title('PROMEDIO POR HEURÍSTICA DE USABILIDAD', fontweight='bold', pad=20)
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    plt.savefig('graficos/promedio_heuristicas.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 2. GRÁFICO DE RADAR (SPIDER CHART)
    fig = plt.figure(figsize=(10, 10))
    ax = fig.add_subplot(111, polar=True)
    
    angles = np.linspace(0, 2*np.pi, len(df_heuristicas), endpoint=False).tolist()
    values = df_heuristicas['Promedio'].tolist()
    values += values[:1]  # Cerrar el círculo
    angles += angles[:1]  # Cerrar el círculo
    
    ax.plot(angles, values, 'o-', linewidth=2, label='Puntuación', color='#2E8B57')
    ax.fill(angles, values, alpha=0.25, color='#2E8B57')
    
    # Configurar el radar
    ax.set_theta_offset(np.pi/2)
    ax.set_theta_direction(-1)
    ax.set_thetagrids(np.degrees(angles[:-1]), df_heuristicas['Heurística'])
    
    # Configurar ejes
    ax.set_ylim(0, 5)
    plt.yticks([1, 2, 3, 4, 5], ["1", "2", "3", "4", "5"], color="grey", size=8)
    plt.title('PERFIL DE USABILIDAD - GRÁFICO RADAR', size=14, fontweight='bold', pad=20)
    plt.savefig('graficos/radar_usabilidad.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 3. GRÁFICO DE LÍNEA - EVOLUCIÓN POR PREGUNTA
    plt.figure(figsize=(15, 6))
    preguntas = [f'Q{i}' for i in range(1, 21)]
    promedios_preguntas = [df[f'Q{i}'].mean() for i in range(1, 21)]
    
    plt.plot(preguntas, promedios_preguntas, marker='o', linewidth=2, markersize=6, 
             color='#4169E1', markerfacecolor='red')
    
    # Línea de promedio global
    plt.axhline(y=promedio_global, color='r', linestyle='--', alpha=0.7, 
                label=f'Promedio Global: {promedio_global:.2f}')
    
    plt.xlabel('Preguntas (Q1 a Q20)')
    plt.ylabel('Puntuación Promedio')
    plt.title('EVOLUCIÓN DE PUNTUACIONES POR PREGUNTA', fontweight='bold', pad=20)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('graficos/evolucion_preguntas.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 4. HEATMAP DE CORRELACIONES
    plt.figure(figsize=(12, 10))
    correlation_matrix = df.corr()
    mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
    
    sns.heatmap(correlation_matrix, mask=mask, annot=True, cmap='coolwarm', 
                center=0, square=True, fmt='.2f', cbar_kws={'shrink': .8})
    plt.title('MATRIZ DE CORRELACIÓN ENTRE PREGUNTAS', fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig('graficos/heatmap_correlaciones.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    print("📊 Gráficos generados en la carpeta 'graficos/'")

def analizar_usabilidad_completa(csv_path="Preguntas Nielsen (respuestas).csv"):
    """
    Análisis completo de usabilidad con todos los datos requeridos
    """
    
    # Nombres reales de las heurísticas
    nombres_heuristicas = {
        1: "1. Visibilidad del Estado",
        2: "2. Lenguaje Familiar", 
        3: "3. Control y Libertad",
        4: "4. Consistencia",
        5: "5. Prevención de Errores",
        6: "6. Reconocer vs Recordar",
        7: "7. Eficiencia",
        8: "8. Diseño Minimalista",
        9: "9. Recuperación de Errores",
        10: "10. Ayuda y Documentación"
    }
    
    # Leer y validar datos
    df = pd.read_csv(csv_path)
    if df.shape[1] == 20:
        df.columns = [f"Q{i}" for i in range(1, 21)]
    df = df.apply(pd.to_numeric, errors="coerce")
    
    # === CÁLCULO DE PROMEDIOS POR PREGUNTA ===
    promedio_pregunta = df.mean(axis=0)
    std_pregunta = df.std(axis=0)
    
    # === CÁLCULO DE PROMEDIOS POR HEURÍSTICA ===
    promedios_heuristica = []
    resultados_heuristicas = []
    
    for h in range(1, 11):
        q1, q2 = f"Q{2*h-1}", f"Q{2*h}"
        scores_heuristic = df[[q1, q2]].mean(axis=1)
        promedio_h = scores_heuristic.mean()
        std_h = scores_heuristic.std()
        
        # Para el formato que necesitas
        promedios_heuristica.append((f"Heurística {h}", q1, q2, round(promedio_h, 4)))
        
        # Para el análisis detallado
        resultados_heuristicas.append({
            'Heurística_ID': h,
            'Heurística': nombres_heuristicas[h],
            'Preguntas': f"{q1}, {q2}",
            'Promedio': promedio_h,
            'Desviación': std_h,
            'Fortaleza': 'Alta' if promedio_h >= 4.3 else 'Media' if promedio_h >= 3.7 else 'Baja'
        })
    
    df_heuristicas = pd.DataFrame(resultados_heuristicas)
    promedio_global = df.values.flatten().mean()
    
    # === IMPRIMIR RESULTADOS EN EL FORMATO SOLICITADO ===
    print("=== Promedio por PREGUNTA (Q1..Q20) ===")
    for i, (col, val) in enumerate(promedio_pregunta.items(), 1):
        print(f"{col}: {val:.4f}")
    
    print("\n=== Promedio por HEURÍSTICA (cada par de preguntas) ===")
    for h, q1, q2, val in promedios_heuristica:
        print(f"{h} ({q1}, {q2}): {val:.4f}")
    
    print(f"\n=== Promedio GLOBAL ===\nGlobal: {promedio_global:.4f}")
    
    # === ANÁLISIS COMPLETO ADICIONAL ===
    print("\n" + "="*70)
    print("           INFORME COMPLETO DE USABILIDAD")
    print("="*70)
    
    print(f"\n📈 PUNTUACIÓN GLOBAL: {promedio_global:.2f}/5.0 → {promedio_global*20:.1f}%")
    print("   ✅ NIVEL: USABILIDAD EXCELENTE" if promedio_global >= 4.0 else 
          "   ⚠️  NIVEL: USABILIDAD ACEPTABLE")
    
    print(f"\n🎯 RANGO DE PUNTUACIONES: {promedio_pregunta.min():.2f} - {promedio_pregunta.max():.2f}")
    print(f"📊 CONSISTENCIA: Desviación estándar global {df.values.flatten().std():.2f}")
    
    print("\n🔍 TOP 3 PREGUNTAS MÁS ALTAS:")
    top_preguntas = promedio_pregunta.nlargest(3)
    for preg, val in top_preguntas.items():
        print(f"   🏆 {preg}: {val:.2f}")
    
    print("\n🔧 TOP 3 PREGUNTAS MÁS BAJAS:")
    bottom_preguntas = promedio_pregunta.nsmallest(3)
    for preg, val in bottom_preguntas.items():
        print(f"   📍 {preg}: {val:.2f}")
    
    # GENERAR GRÁFICOS
    generar_graficos_usabilidad(df, df_heuristicas, promedio_global)
    
    # GUARDAR TODOS LOS DATOS EN EXCEL
    with pd.ExcelWriter("Reporte_Usabilidad_Completo.xlsx") as writer:
        # Hoja 1: Promedios por pregunta (formato solicitado)
        df_preguntas = pd.DataFrame({
            'Pregunta': promedio_pregunta.index,
            'Promedio': promedio_pregunta.values.round(4),
            'Desviación Estándar': std_pregunta.values.round(4)
        })
        df_preguntas.to_excel(writer, sheet_name="Promedio por Pregunta", index=False)
        
        # Hoja 2: Promedios por heurística (formato solicitado)
        df_heuristica_simple = pd.DataFrame(promedios_heuristica, 
                                          columns=['Heurística', 'Pregunta_1', 'Pregunta_2', 'Promedio'])
        df_heuristica_simple.to_excel(writer, sheet_name="Promedio por Heurística", index=False)
        
        # Hoja 3: Análisis detallado
        df_heuristicas.to_excel(writer, sheet_name="Análisis Detallado", index=False)
        
        # Hoja 4: Resumen ejecutivo
        resumen = pd.DataFrame({
            'Métrica': ['Puntuación Global', 'Porcentaje', 'Nivel', 'Mejor Heurística', 'Peor Heurística'],
            'Valor': [
                f"{promedio_global:.2f}/5.0", 
                f"{promedio_global*20:.1f}%",
                "Excelente" if promedio_global >= 4.0 else "Aceptable",
                df_heuristicas.loc[df_heuristicas['Promedio'].idxmax(), 'Heurística'],
                df_heuristicas.loc[df_heuristicas['Promedio'].idxmin(), 'Heurística']
            ]
        })
        resumen.to_excel(writer, sheet_name="Resumen Ejecutivo", index=False)
        
        # Hoja 5: Datos brutos
        df.to_excel(writer, sheet_name="Datos Brutos", index=False)
    
    print(f"\n💾 Reporte Excel guardado: 'Reporte_Usabilidad_Completo.xlsx'")
    print("📊 Gráficos guardados en carpeta: 'graficos/'")
    
    return df_heuristicas, promedio_global, promedios_heuristica

# EJECUTAR ANÁLISIS COMPLETO
if __name__ == "__main__":
    print("🚀 INICIANDO ANÁLISIS COMPLETO DE USABILIDAD...")
    df_heuristicas, global_score, promedios_heuristica = analizar_usabilidad_completa()
    
    print("\n✅ ANÁLISIS COMPLETADO EXITOSAMENTE!")
    print("📁 Archivos generados:")
    print("   • Reporte_Usabilidad_Completo.xlsx (5 hojas)")
    print("   • graficos/promedio_heuristicas.png")
    print("   • graficos/radar_usabilidad.png") 
    print("   • graficos/evolucion_preguntas.png")
    print("   • graficos/heatmap_correlaciones.png")