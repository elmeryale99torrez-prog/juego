# Modelo Matemático y Dinámica de Sistemas de EcoMetrópolis Santa Cruz
## Especificación de Variables de Estado, Ecuaciones de Balance y Umbrales Críticos

---

### 1. Vector de Estado Territorial $\vec{S}_t$

En cada período anual $t \in [2026, 2035]$, el sistema biofísico y socioeconómico queda definido por el vector:

$$\vec{S}_t = \begin{pmatrix} B_t \\ A_t \\ W_t \\ C_t \\ H_t \\ D_t \\ Y_t \end{pmatrix}$$

Donde:
* $B_t \in [0, 100]$: Cobertura de bosque primario y reserva forestal (% remanente).
* $A_t \in [5, \infty)$: Calidad del aire ($PM_{2.5}$ en $\mu\text{g}/\text{m}^3$).
* $W_t \in [0, 100]$: Tasa de recarga freática del acuífero Urubó/Piraí (%).
* $C_t \in [0, 100]$: Tasa de economía circular y valorización de residuos 9R (%).
* $H_t \in [0, 100]$: Nivel de ocupación hospitalaria por afecciones respiratorias (%).
* $D_t \in [0, 100]$: Descontento social y tensión comunitaria (%).
* $Y_t \in [20, \infty)$: Índice de actividad económica (base $100$).

---

### 2. Ecuación de Transición Temporal

El estado en el período $t+1$ resulta de la superposición del desgaste inercial metabólico, las políticas activadas $\mathcal{M}_t$ y el evento estocástico anual $E_t$:

$$\vec{S}_{t+1} = \vec{S}_t + \vec{\Delta}_{\text{inercial}} + \sum_{m \in \mathcal{M}_t} \vec{\delta}_m + \vec{\epsilon}(E_t) + \vec{\phi}(\vec{S}_t)$$

#### 2.1. Vector de Inercia Metabólica Urbana ($\vec{\Delta}_{\text{inercial}}$)
Expresa la degradación de baja entropía sin intervención correctiva:

$$\vec{\Delta}_{\text{inercial}} = \begin{pmatrix} -0.8 \\ +2.5 \\ -1.2 \\ 0.0 \\ 0.0 \\ 0.0 \\ +1.0 \end{pmatrix}$$

#### 2.2. Operador de Bucles de Retroalimentación Biofísica $\vec{\phi}(\vec{S}_t)$

1. **Retroalimentación por Crisis Atmosférica ($A_t > 55\ \mu\text{g}/\text{m}^3$):**
   $$\Delta H_t = 0.45 \cdot (A_t - 55)$$
   $$\Delta D_t = 0.135 \cdot (A_t - 55)$$

2. **Retroalimentación por Estrés Hídrico ($W_t < 50\%$):**
   $$\Delta D_t = 0.60 \cdot (50 - W_t)$$
   $$\Delta Y_t = -0.12 \cdot (50 - W_t)$$

3. **Retroalimentación por Parálisis Social ($D_t > 70\%$):**
   $$\Delta Y_t = -4.0$$

---

### 3. Modelo de Presupuesto Dinámico $P_{t+1}$

La capacidad fiscal anual de inversión depende de la producción económica y de la estabilidad institucional:

$$P_{t+1} = \text{round}\left( P_{\text{base}} \cdot \max\left(0.60, \frac{Y_t}{100} \cdot \left(1 - \frac{D_t}{200}\right)\right) \right)$$

---

### 4. Función de Dictamen Final de Sostenibilidad (Tribunal UAGRM)

Al concluir el año 2035, el índice global de sostenibilidad fuerte $\mathcal{I}_{\text{sust}} \in [0, 100]$ se computa como:

$$\mathcal{I}_{\text{sust}} = \omega_B \cdot f(B_{2035}) + \omega_A \cdot g(A_{2035}) + \omega_W \cdot h(W_{2035}) + \omega_C \cdot k(C_{2035}) + \omega_S \cdot l(H_{2035}, D_{2035})$$

Con pesos normalizados:
* Cobertura boscosa ($\omega_B = 0.25$)
* Calidad atmosférica ($\omega_A = 0.25$)
* Reserva freática ($\omega_W = 0.25$)
* Economía circular ($\omega_C = 0.15$)
* Paz y salud social ($\omega_S = 0.10$)

#### Clasificación según Umbral:
* $\mathcal{I}_{\text{sust}} \ge 85$: **Sostenibilidad Fuerte y Regenerativa** (Paradigma Dasgupta / Georgescu-Roegen).
* $60 \le \mathcal{I}_{\text{sust}} < 85$: **Sostenibilidad Débil / Transición Moderada** (Paradigma Neoclásico Pigouviano).
* $35 \le \mathcal{I}_{\text{sust}} < 60$: **Deterioro Biofísico Acelerado** (Extractivismo y externalización).
* $\mathcal{I}_{\text{sust}} < 35$: **Colapso Metabólico Territorial** (Tragedia de Hardin sin gobernanza).
