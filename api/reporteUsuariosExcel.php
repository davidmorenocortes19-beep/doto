<?php
require_once 'config.php';
require_once BASE_PATH . '/models/Usuario.php';

$datos = Usuario::listarTodos();

header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
header('Content-Disposition: attachment; filename="reporte_usuarios_' . date('Y-m-d') . '.xls"');
header('Pragma: no-cache');
header('Expires: 0');

function escaparXML($valor) {
    return htmlspecialchars((string) $valor, ENT_QUOTES | ENT_XML1, 'UTF-8');
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">

 <Styles>

  <Style ss:ID="Empresa">
   <Font ss:Bold="1" ss:Size="16" ss:Color="#1E293B"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>

  <Style ss:ID="EmpresaDato">
   <Font ss:Size="9" ss:Color="#555555"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>

  <Style ss:ID="LineaGruesa">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="3" ss:Color="#1E293B"/>
   </Borders>
  </Style>

  <Style ss:ID="Titulo">
   <Font ss:Bold="1" ss:Size="13" ss:Color="#1E293B"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>

  <Style ss:ID="Subtitulo">
   <Font ss:Size="9" ss:Color="#888888"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>

  <Style ss:ID="Encabezado">
   <Font ss:Bold="1" ss:Size="10" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
   </Borders>
  </Style>

  <Style ss:ID="CeldaPar">
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <Font ss:Size="10" ss:Color="#333333"/>
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
   </Borders>
  </Style>

  <Style ss:ID="CeldaImpar">
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Font ss:Size="10" ss:Color="#333333"/>
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DDDDDD"/>
   </Borders>
  </Style>

  <Style ss:ID="Pie">
   <Font ss:Size="8" ss:Color="#AAAAAA"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#EEEEEE"/>
   </Borders>
  </Style>

 </Styles>

 <Worksheet ss:Name="Usuarios">
  <Table>
   <Column ss:Width="40"/>
   <Column ss:Width="150"/>
   <Column ss:Width="90"/>
   <Column ss:Width="180"/>
   <Column ss:Width="90"/>
   <Column ss:Width="160"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>

   <!-- ENCABEZADO EMPRESA -->
   <Row ss:Height="24">
    <Cell ss:StyleID="Empresa" ss:MergeAcross="7"><Data ss:Type="String">Dotaciones Toronto</Data></Cell>
   </Row>
   <Row ss:Height="15">
    <Cell ss:StyleID="EmpresaDato" ss:MergeAcross="7"><Data ss:Type="String">dotaciones.elobrero@gmail.com</Data></Cell>
   </Row>
   <Row ss:Height="15">
    <Cell ss:StyleID="EmpresaDato" ss:MergeAcross="7"><Data ss:Type="String">Carrera 63 Sur #21-12, Bogotá D.C., Colombia</Data></Cell>
   </Row>
   <Row ss:Height="15">
    <Cell ss:StyleID="EmpresaDato" ss:MergeAcross="7"><Data ss:Type="String">+57 321 209 9989</Data></Cell>
   </Row>
   <Row ss:Height="6">
    <Cell ss:StyleID="LineaGruesa" ss:MergeAcross="7"><Data ss:Type="String"></Data></Cell>
   </Row>
   <Row ss:Height="8"></Row>

   <!-- TÍTULO Y FECHA -->
   <Row ss:Height="20">
    <Cell ss:StyleID="Titulo" ss:MergeAcross="7"><Data ss:Type="String">Reporte de Usuarios</Data></Cell>
   </Row>
   <Row ss:Height="16">
    <Cell ss:StyleID="Subtitulo" ss:MergeAcross="7"><Data ss:Type="String">Generado el: <?php echo date('d/m/Y H:i'); ?></Data></Cell>
   </Row>
   <Row ss:Height="8"></Row>

   <!-- TABLA -->
   <Row ss:Height="22">
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">ID</Data></Cell>
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">Nombre</Data></Cell>
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">Documento</Data></Cell>
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">Correo</Data></Cell>
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">Teléfono</Data></Cell>
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">Dirección</Data></Cell>
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">Rol</Data></Cell>
    <Cell ss:StyleID="Encabezado"><Data ss:Type="String">Estado</Data></Cell>
   </Row>

   <?php foreach ($datos as $i => $item):
        $estilo = ($i % 2 === 0) ? 'CeldaPar' : 'CeldaImpar';
        $estado = $item['estado'] ?? 'Habilitado';
   ?>
   <Row ss:Height="18">
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="Number"><?php echo (int) $item['id_usuario']; ?></Data></Cell>
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="String"><?php echo escaparXML($item['nombre']); ?></Data></Cell>
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="String"><?php echo escaparXML($item['documento']); ?></Data></Cell>
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="String"><?php echo escaparXML($item['correo']); ?></Data></Cell>
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="String"><?php echo escaparXML($item['telefono']); ?></Data></Cell>
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="String"><?php echo escaparXML($item['direccion']); ?></Data></Cell>
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="String"><?php echo escaparXML($item['nombre_rol']); ?></Data></Cell>
    <Cell ss:StyleID="<?php echo $estilo; ?>"><Data ss:Type="String"><?php echo escaparXML($estado); ?></Data></Cell>
   </Row>
   <?php endforeach; ?>

   <Row ss:Height="8"></Row>

   <!-- PIE DE PÁGINA -->
   <Row ss:Height="18">
    <Cell ss:StyleID="Pie" ss:MergeAcross="7"><Data ss:Type="String">Dotaciones Toronto  |  dotaciones.elobrero@gmail.com  |  +57 321 209 9989</Data></Cell>
   </Row>

  </Table>

  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Landscape"/>
    <Header x:Margin="0.3"/>
    <Footer x:Margin="0.3"/>
    <PageMargins x:Bottom="0.5" x:Left="0.5" x:Right="0.5" x:Top="0.5"/>
   </PageSetup>
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>9</SplitHorizontal>
   <TopRowBottomPane>9</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>

 </Worksheet>
</Workbook>
<?php exit; ?>