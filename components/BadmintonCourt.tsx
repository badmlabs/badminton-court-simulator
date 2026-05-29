import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, Alert } from 'react-native';
import { Appbar, Text as PaperText } from 'react-native-paper';
import { PlayerMarker } from './PlayerMarker';
import { IconButton } from './IconButton';
import { useCourtPositions } from '../hooks/useCourtPositions';
import { PositionTrail } from './PositionTrail';
import { SettingsPanel } from './SettingsPanel';
import { StepsPanel } from './StepsPanel';
import { useMarkerCustomization } from '../context/MarkerCustomizationContext';
import { useDrillImport } from '../context/DrillImportContext';
import { decodeDrillFromEncoded } from '../utils/stepSerialization';

export default function BadmintonCourt() {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  
  const BUTTON_CONTAINER_HEIGHT = 80;
  const BANNER_HEIGHT = 50;
  const availableHeight = screenHeight - 2.2*BUTTON_CONTAINER_HEIGHT - BANNER_HEIGHT;
  
  // Without rotation, use normal width/height mapping
  const courtWidth = screenWidth;      // Container width matches screen width
  const courtHeight = availableHeight; // Container height matches available height

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isStepsPanelVisible, setIsStepsPanelVisible] = useState(false);
  const { customizations, updateMarkerCustomization } = useMarkerCustomization();
  const { pendingEncodedPayload, clearPendingImport } = useDrillImport();

  const {
    isDoubles,
    playerPositions,
    shuttlePosition,
    ghostPositions,
    updatePlayerPosition,
    updateShuttlePosition,
    handlePositionChangeComplete,
    toggleGameMode,
    resetPositions,
    undo,
    redo,
    canUndo,
    canRedo,
    showPlayerTrails,
    showShuttleTrail,
    togglePlayerTrails,
    toggleShuttleTrail,
    drillSteps,
    currentStepIndex,
    goToStep,
    importDrill,
  } = useCourtPositions({ width: courtWidth, height: courtHeight });


  useEffect(() => {
    if (!pendingEncodedPayload) return;
    try {
      const { steps, isDoubles: importedDoubles, title } = decodeDrillFromEncoded(
        pendingEncodedPayload,
        { width: courtWidth, height: courtHeight }
      );
      importDrill(steps, importedDoubles);
      const label = title ? `"${title}"` : 'Drill';
      Alert.alert('Drill loaded', `${label} — ${steps.length} step${steps.length === 1 ? '' : 's'} imported.`);
    } catch {
      Alert.alert('Invalid link', 'This drill link could not be loaded.');
    } finally {
      clearPendingImport();
    }
  }, [pendingEncodedPayload, courtWidth, courtHeight, importDrill, clearPendingImport]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.banner}>
        <Appbar.Action icon="menu" onPress={() => setIsMenuVisible(true)} />
        <Appbar.Content title="Badminton Court Simulator" />
      </Appbar.Header>

      <View style={[styles.courtWrapper, { marginBottom: BUTTON_CONTAINER_HEIGHT }]}>
        <View 
          style={[
            styles.courtContainer, 
            { 
              width: courtWidth, 
              height: courtHeight,
            }
          ]}
        >
          <Image
            source={require('../assets/badminton-court.png')}
            style={styles.courtImage}
            resizeMode="stretch"
          />

          {showPlayerTrails && playerPositions.team1.map((pos, index) => (
            ghostPositions?.team1[index] && (
              <PositionTrail
                key={`trail-team1-${index}`}
                currentPosition={pos}
                ghostPosition={ghostPositions.team1[index]!}
                color={customizations[index === 0 ? 'P1' : 'P2'].color}
              />
            )
          ))}
          {showPlayerTrails && playerPositions.team2.map((pos, index) => (
            ghostPositions?.team2[index] && (
              <PositionTrail
                key={`trail-team2-${index}`}
                currentPosition={pos}
                ghostPosition={ghostPositions.team2[index]!}
                color={customizations[index === 0 ? 'P3' : 'P4'].color}
              />
            )
          ))}
          {showShuttleTrail && shuttlePosition && ghostPositions?.shuttle && (
            <PositionTrail
              currentPosition={shuttlePosition}
              ghostPosition={ghostPositions.shuttle}
              color={customizations.Shuttle.color}
            />
          )}

          {playerPositions.team1.map((pos, index) => (
            <PlayerMarker 
              key={`team1-${index}`}
              position={pos}
              color={customizations[index === 0 ? 'P1' : 'P2'].color}
              size={customizations[index === 0 ? 'P1' : 'P2'].size}
              isLeftHanded={customizations[index === 0 ? 'P1' : 'P2'].isLeftHanded}
              icon={customizations[index === 0 ? 'P1' : 'P2'].icon}
              iconType={customizations[index === 0 ? 'P1' : 'P2'].iconType}
              onPositionChange={(newPos) => updatePlayerPosition('team1', index, newPos)}
              onPositionStart={(newPos) => updatePlayerPosition('team1', index, newPos, true)}
              onPositionChangeComplete={handlePositionChangeComplete}
              onColorChange={(color) => updateMarkerCustomization(index === 0 ? 'P1' : 'P2', { color })}
              onSizeChange={(size) => updateMarkerCustomization(index === 0 ? 'P1' : 'P2', { size })}
              onIconChange={(icon) => updateMarkerCustomization(index === 0 ? 'P1' : 'P2', { icon })}
            />
          ))}
          {playerPositions.team2.map((pos, index) => (
            <PlayerMarker 
              key={`team2-${index}`}
              position={pos}
              color={customizations[index === 0 ? 'P3' : 'P4'].color}
              size={customizations[index === 0 ? 'P3' : 'P4'].size}
              isLeftHanded={customizations[index === 0 ? 'P3' : 'P4'].isLeftHanded}
              icon={customizations[index === 0 ? 'P3' : 'P4'].icon}
              iconType={customizations[index === 0 ? 'P3' : 'P4'].iconType}
              onPositionChange={(newPos) => updatePlayerPosition('team2', index, newPos)}
              onPositionStart={(newPos) => updatePlayerPosition('team2', index, newPos, true)}
              onPositionChangeComplete={handlePositionChangeComplete}
              onColorChange={(color) => updateMarkerCustomization(index === 0 ? 'P3' : 'P4', { color })}
              onSizeChange={(size) => updateMarkerCustomization(index === 0 ? 'P3' : 'P4', { size })}
              onIconChange={(icon) => updateMarkerCustomization(index === 0 ? 'P3' : 'P4', { icon })}
            />
          ))}

          <PlayerMarker
            position={shuttlePosition}
            color={customizations.Shuttle.color}
            size={customizations.Shuttle.size}
            icon={customizations.Shuttle.icon}
            iconType={customizations.Shuttle.iconType}
            onPositionChange={updateShuttlePosition}
            onPositionStart={(newPos) => updateShuttlePosition(newPos, true)}
            onPositionChangeComplete={handlePositionChangeComplete}
            onColorChange={(color) => updateMarkerCustomization('Shuttle', { color })}
            onSizeChange={(size) => updateMarkerCustomization('Shuttle', { size })}
            onIconChange={(icon) => updateMarkerCustomization('Shuttle', { icon })}
          />
        </View>
      </View>

      <View style={[styles.buttonContainer, { 
        height: BUTTON_CONTAINER_HEIGHT,
        bottom: 4
      }]}>
        {/* Left group: Game setup */}
        <View style={styles.buttonGroupContainer}>
          <PaperText variant="labelSmall" style={styles.buttonGroupLabel}>Game Setup</PaperText>
          <View style={styles.buttonGroup}>
            <IconButton
              icon="refresh"
              onPress={resetPositions}
            />
            <IconButton
              icon={isDoubles ? "account-group" : "account"}
              onPress={() => toggleGameMode(!isDoubles)}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Center group: History Navigation */}
        <View style={styles.buttonGroupContainer}>
          <PaperText variant="labelSmall" style={styles.buttonGroupLabel}>History</PaperText>
          <View style={styles.buttonGroup}>
            <IconButton
              icon="undo"
              onPress={undo}
              disabled={!canUndo}
            />
            <IconButton
              icon="redo"
              onPress={redo}
              disabled={!canRedo}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Right group: Trail Markers */}
        <View style={styles.buttonGroupContainer}>
          <PaperText variant="labelSmall" style={styles.buttonGroupLabel}>Trails</PaperText>
          <View style={styles.buttonGroup}>
            <IconButton
              icon="shoe-print"
              onPress={togglePlayerTrails}
              active={showPlayerTrails}
            />
            <IconButton
              icon="badminton"
              onPress={toggleShuttleTrail}
              active={showShuttleTrail}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.buttonGroupContainer}>
          <PaperText variant="labelSmall" style={styles.buttonGroupLabel}>Steps</PaperText>
          <View style={styles.buttonGroup}>
            <IconButton
              icon="format-list-numbered"
              onPress={() => setIsStepsPanelVisible(true)}
            />
          </View>
        </View>
      </View>

      <SettingsPanel
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />

      <StepsPanel
        isVisible={isStepsPanelVisible}
        onClose={() => setIsStepsPanelVisible(false)}
        steps={drillSteps}
        currentStepIndex={currentStepIndex}
        isDoubles={isDoubles}
        courtDimensions={{ width: courtWidth, height: courtHeight }}
        onSelectStep={goToStep}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courtWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  courtContainer: {
    position: 'relative',
  },
  courtImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginHorizontal: 10,
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  banner: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  buttonGroupLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonGroupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
}); 