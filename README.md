# 🛸 Sim-to-Real Drone Detection using Duality AI Falcon and YOLO11n

> A lightweight object detection pipeline for detecting **drones** and distinguishing them from **birds** in Electro-Optical (EO) imagery using synthetic-data-driven training and YOLO11n.

<p align="center">
  <b>AI/ML Track — Elite Coders Summer of Code (ECSoC)</b>
</p>

---

## 📌 Project Overview

Reliable drone detection is challenging when aerial targets are small, distant, partially occluded, or visually similar to birds.

This project develops an end-to-end object detection pipeline for detecting **drones in Electro-Optical (EO) imagery** while explicitly modeling **birds as a separate confuser class**.

The project combines:

- Synthetic-data-driven dataset preparation using the Duality AI Falcon ecosystem
- Drone and bird object detection
- YOLO-format annotation processing
- YOLO11n model training
- Quantitative validation
- Confusion-matrix analysis
- Precision, Recall, F1, and PR curve analysis
- Ground-truth and prediction visualization
- Lightweight model packaging for future deployment experiments

The final model achieves:

- **94.45% Precision**
- **85.58% Recall**
- **90.53% mAP@0.50**
- **64.73% mAP@0.50–0.95**

with a final model size of approximately **5.19 MB**.

---

# 🎯 Problem Statement

Drone detection in EO imagery presents several challenges:

- Drones may occupy only a small number of pixels.
- Birds can visually resemble distant drones.
- Complex backgrounds can reduce target visibility.
- Lighting, scale, viewpoint, and environmental conditions vary significantly.
- Synthetic training data may differ from real-world imagery.

A drone-only detector may incorrectly classify visually similar airborne objects as drones.

To address this problem, the final detection task was formulated as a **two-class object detection problem**:

| Class ID | Class |
|---|---|
| `0` | Drone |
| `1` | Bird |

Birds were intentionally included as a separate class so that the model could learn to distinguish drones from a common airborne visual confuser.

---

# 🧠 Key Idea

Instead of asking the model only:

> “Is there a drone?”

the detector is trained to solve a harder problem:

> “Is this airborne object a drone or a bird?”

This explicit two-class formulation provides the model with supervised examples of both target and confuser objects.

---

# 🔄 Complete Project Pipeline

```text
Duality AI Falcon
        ↓
Synthetic EO Data Generation
        ↓
Drone + Bird Dataset Construction
        ↓
YOLO Annotation Preparation
        ↓
Dataset Verification
        ↓
Train / Validation Split
        ↓
YOLO11n Training
        ↓
Best Checkpoint Selection
        ↓
Final Validation
        ↓
Precision / Recall / mAP Evaluation
        ↓
Confusion Matrix & Performance Curves
        ↓
Qualitative Prediction Analysis
        ↓
Final EO Detection Model
```

---

# 🛰️ Synthetic Data and Duality AI Falcon

The project uses a synthetic-data-driven workflow associated with the Duality AI Falcon environment.

The dataset preparation process was designed to expose the detector to variation in:

- Object position
- Object scale
- Viewing perspective
- Sky appearance
- Vegetation
- Rural environments
- Complex backgrounds
- Drone presence
- Bird presence
- Small and distant aerial targets

A pixels-on-target-oriented approach was considered during dataset preparation to improve the representation of aerial objects at different apparent sizes.

The objective was to build a detector capable of learning useful visual representations from diverse EO imagery while addressing the drone-versus-bird discrimination problem.

---

# 📊 Dataset

## Final Dataset Summary

| Split | Images | Label Files |
|---|---:|---:|
| Training | 1,521 | 1,521 |
| Validation | 441 | 441 |
| **Total** | **1,962** | **1,962** |

The dataset follows the standard YOLO object detection structure:

```text
combined_eo_v2/
│
├── train/
│   ├── images/
│   └── labels/
│
├── val/
│   ├── images/
│   └── labels/
│
└── data.yaml
```

Each image has a corresponding YOLO-format annotation file.

The annotation format is:

```text
class_id x_center y_center width height
```

Bounding-box coordinates are normalized relative to image dimensions.

---

# 🔍 Dataset Verification

Before final model evaluation, the dataset was programmatically verified.

The verification process checked:

- Training image count
- Training label count
- Validation image count
- Validation label count
- Image-label correspondence
- Class IDs
- YOLO annotation structure
- Invalid annotation lines

Verified dataset counts:

```text
========== DATASET VERIFICATION ==========

Training images     : 1521
Training labels     : 1521

Validation images   : 441
Validation labels   : 441

Total images        : 1962

==========================================
```

Ground-truth annotations were also visualized to manually verify bounding-box placement and class mapping.

---

# 🖼️ Training Data Characteristics

The final training dataset contains:

- Drone-only scenes
- Bird-only scenes
- Scenes containing both drones and birds
- Open-sky environments
- Vegetation-heavy backgrounds
- Rural terrain
- Objects at different scales
- Small and distant aerial targets

The inclusion of both classes creates a more challenging detection task than simple drone-versus-background classification.

---

# 🤖 Model Architecture

The final detector uses **YOLO11n**, the lightweight nano variant of the YOLO11 family.

## Model Characteristics

| Property | Value |
|---|---|
| Architecture | YOLO11n |
| Parameters | 2,582,542 |
| Computational Complexity | 6.3 GFLOPs |
| Final Model Size | ~5.19 MB |
| Input Resolution | 512 × 512 |
| Number of Classes | 2 |
| Classes | Drone, Bird |

YOLO11n was selected because it provides a practical balance between:

- Detection performance
- Computational efficiency
- Small model size
- Fast inference
- Potential edge-deployment suitability

---

# 🏋️ Model Training

The training workflow consisted of:

1. Preparing the final EO dataset.
2. Verifying image and annotation integrity.
3. Loading pretrained YOLO11n weights.
4. Configuring the two-class detection task.
5. Training on the prepared training split.
6. Evaluating against the validation split.
7. Selecting the best-performing checkpoint.
8. Saving the final trained model.

The final model checkpoint is stored as:

```text
models/final_eo_model.pt
```

The original best checkpoint was preserved and renamed for clear final-project organization.

---

# 📈 Final Validation Results

The final YOLO11n model was evaluated on the held-out validation split.

| Metric | Result |
|---|---:|
| **Precision** | **0.9445** |
| **Recall** | **0.8558** |
| **mAP@0.50** | **0.9053** |
| **mAP@0.50–0.95** | **0.6473** |

Equivalent percentage values:

```text
Precision       : 94.45%
Recall          : 85.58%
mAP@0.50        : 90.53%
mAP@0.50–0.95   : 64.73%
```

---

# 📉 Results Interpretation

## Precision — 94.45%

The model achieved high precision, indicating that the majority of predicted detections corresponded to valid target objects.

This suggests relatively strong control over false-positive detections.

## Recall — 85.58%

The model successfully detected most annotated objects in the validation dataset.

The lower recall compared with precision indicates that some challenging targets may still be missed, particularly:

- Very small objects
- Low-contrast targets
- Partially occluded objects
- Targets near complex backgrounds

## mAP@0.50 — 90.53%

The high mAP@0.50 demonstrates strong overall object detection capability at the standard IoU threshold.

## mAP@0.50–0.95 — 64.73%

This metric evaluates detection performance across increasingly strict localization thresholds.

The result indicates solid overall detection performance while also highlighting the difficulty of highly precise bounding-box localization for small aerial objects.

---

# 🔀 Confusion Matrix Analysis

The normalized confusion matrix showed strong class-level discrimination.

Approximate normalized diagonal performance:

- **Drone:** 0.88
- **Bird:** 0.89

The model demonstrated low direct confusion between drone and bird classes.

This supports the decision to explicitly include birds as a separate training class.

---

# 📊 Evaluation Artifacts

The project generates and analyzes the following evaluation artifacts:

```text
BoxF1_curve.png
BoxPR_curve.png
BoxP_curve.png
BoxR_curve.png
confusion_matrix.png
confusion_matrix_normalized.png

val_batch0_labels.jpg
val_batch0_pred.jpg

val_batch1_labels.jpg
val_batch1_pred.jpg

val_batch2_labels.jpg
val_batch2_pred.jpg
```

These artifacts provide both quantitative and qualitative evidence of model performance.

---

# ⚡ Model Efficiency

The final model is intentionally lightweight.

```text
Architecture       : YOLO11n
Parameters         : 2,582,542
GFLOPs             : 6.3
Model Size         : ~5.19 MB
Input Resolution   : 512 × 512
Classes            : Drone, Bird
```

During local inference testing on Apple Silicon using the MPS backend, most predictions after device warm-up required approximately:

```text
4–12 ms model inference time per image
```

Actual end-to-end latency depends on preprocessing, postprocessing, hardware, image size, and runtime configuration.

---

# 🧪 Experimental Environments

The project was developed and evaluated across two environments.

## Local Training and Testing

```text
Platform    : macOS
Hardware    : Apple Silicon
Acceleration: PyTorch MPS
Framework   : Ultralytics
Model       : YOLO11n
```

## Google Colab Validation and Documentation

```text
Environment : Google Colab
GPU         : NVIDIA Tesla T4
Framework   : PyTorch + Ultralytics
Purpose     : Reproducible validation and final project documentation
```

The final trained checkpoint was uploaded to Google Drive and loaded in the Colab notebook for reproducible validation and result generation.

---

# 💻 Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd duality-drone-detection
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it on macOS/Linux:

```bash
source venv/bin/activate
```

Install Ultralytics:

```bash
pip install ultralytics
```

Verify the installation:

```bash
python3 -c "import ultralytics; print(ultralytics.__version__)"
```

---

# 🚀 Model Validation

Validate the final model:

```bash
yolo detect val \
  model=models/final_eo_model.pt \
  data=datasets/combined_eo_v2/data.yaml \
  imgsz=512
```

On Apple Silicon:

```bash
yolo detect val \
  model=models/final_eo_model.pt \
  data=datasets/combined_eo_v2/data.yaml \
  imgsz=512 \
  device=mps
```

---

# 🔮 Run Inference

Run inference on a folder of images:

```bash
yolo detect predict \
  model=models/final_eo_model.pt \
  source=path/to/images \
  imgsz=512 \
  conf=0.50 \
  iou=0.45 \
  save=True \
  save_txt=True \
  save_conf=True
```

For Apple Silicon:

```bash
yolo detect predict \
  model=models/final_eo_model.pt \
  source=path/to/images \
  imgsz=512 \
  conf=0.50 \
  iou=0.45 \
  device=mps \
  save=True
```

---

# 📁 Recommended Repository Structure

```text
duality-drone-detection/
│
├── README.md
├── requirements.txt
├── .gitignore
│
├── models/
│   └── final_eo_model.pt
│
├── notebooks/
│   └── Duality_AI_Drone_Detection_Nikshith.ipynb
│
├── results/
│   ├── BoxF1_curve.png
│   ├── BoxPR_curve.png
│   ├── BoxP_curve.png
│   ├── BoxR_curve.png
│   ├── confusion_matrix.png
│   ├── confusion_matrix_normalized.png
│   └── prediction_samples/
│
├── scripts/
│   └── README.md
│
└── docs/
    └── project_report.pdf
```

> The complete dataset may be hosted externally rather than committed directly to GitHub if its size is unsuitable for normal Git version control.

---

# 🔗 Project Resources

## Training Dataset

**Dataset Link:**  
` https://drive.google.com/drive/folders/1MRr5xZdNp9VSPerDJfAYZFhXEkAsjNzF?usp=sharing`

## Google Colab / Jupyter Notebook

**Notebook Link:**  
`<ADD_PUBLIC_COLAB_OR_GOOGLE_DRIVE_NOTEBOOK_LINK>`

## Final Trained Model

**Model Link:**  
`https://colab.research.google.com/drive/12KS08GwfEkUjp84FA7NwRv6IUyVN3z3p?usp=sharing`

---

# 💡 Key Design Decisions

## Why YOLO11n?

YOLO11n provides a strong balance between:

- Accuracy
- Speed
- Small model size
- Computational efficiency

This makes it suitable for experimentation with lightweight aerial object detection.

## Why Include Birds?

Birds are a major visual confuser in drone detection.

Instead of treating birds as generic background objects, they were explicitly modeled as a separate class.

This allows the detector to learn the visual differences between:

```text
Drone ↔ Bird
```

rather than only:

```text
Drone ↔ Background
```

## Why 512 × 512?

A 512 × 512 evaluation resolution was selected as an efficiency-oriented configuration that retains useful spatial information while reducing computational requirements compared with larger resolutions.

---

# ⚠️ Limitations

The current system has several limitations:

1. Extremely small aerial targets may remain difficult to detect.
2. Complex backgrounds can reduce object visibility.
3. Distant drones and birds may still appear visually similar.
4. Performance may vary across unseen sensors and environments.
5. The dataset is limited to 1,962 images.
6. Reported quantitative metrics are based on the prepared validation split.
7. Real-time camera integration was outside the required scope of the challenge.

The reported results should therefore be interpreted as performance on the current validation setup rather than a guarantee of identical performance in every real-world environment.

---

# 🔭 Future Work

Future improvements could include:

- Larger and more diverse datasets
- Additional real-world test datasets
- Higher-resolution small-object detection
- Multi-scale training
- Image tiling
- Object tracking
- Temporal consistency for video
- Additional confuser classes
- ONNX export
- Quantization
- Model pruning
- Edge-device deployment

Additional confuser categories could include:

```text
Aircraft
Helicopters
Kites
Balloons
```

---

# 🏆 Final Results Summary

```text
Dataset Size      : 1,962 images
Training Images   : 1,521
Validation Images : 441

Architecture      : YOLO11n
Classes           : Drone, Bird
Parameters        : 2.58 million
Model Size        : ~5.19 MB

Precision         : 94.45%
Recall            : 85.58%
mAP@0.50          : 90.53%
mAP@0.50–0.95     : 64.73%
```

---

# 🎓 Project Context

This project was developed as part of the:

**AI/ML Track — Elite Coders Summer of Code (ECSoC)**

using the **Duality AI Falcon** ecosystem for the challenge workflow.

---

# 👨‍💻 Author

## Nooka Nikshith

**AI/ML Developer | B.Tech Artificial Intelligence and Machine Learning**

- GitHub: `<YOUR_GITHUB_PROFILE>`
- LinkedIn: `<YOUR_LINKEDIN_PROFILE>`

---

# 🙏 Acknowledgements

Acknowledgements to:

- Duality AI for the Falcon simulation ecosystem and challenge environment.
- Elite Coders Summer of Code for organizing the AI/ML track.
- Ultralytics for the YOLO object detection framework.

---

# 📜 License and Data Usage

The source code and original project documentation in this repository may be distributed under the license selected for this repository.

Datasets, simulation assets, pretrained weights, third-party software, and externally sourced resources remain subject to their respective original licenses and terms of use.

Users should verify the applicable licensing and redistribution requirements before reusing or redistributing external data or assets.

---

<p align="center">
  <b>Sim-to-Real Drone Detection • Synthetic Data • YOLO11n • Computer Vision</b>
</p>
