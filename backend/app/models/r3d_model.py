import torch
import torch.nn as nn
from torchvision.models.video import r3d_18, R3D_18_Weights

def get_resnet3d():
    weights = R3D_18_Weights.KINETICS400_V1
    model = r3d_18(weights=weights)
    
    # Se eliminar la capa completamente conectada final para extraer características (512-dim)
    model.fc = nn.Identity()
    
    # Congelar todos los parámetros
    for param in model.parameters():
        param.requires_grad = False
        
    # Establecer en modo evaluación para desactivar dropout y batchnorm
    model.eval()
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    return model
